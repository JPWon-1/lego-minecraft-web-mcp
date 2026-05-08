import React from "react";
import type { Block, Track } from "@blockgame/shared";
import { VoxelScene } from "@blockgame/renderer-minecraft";
import { LegoScene } from "@blockgame/renderer-lego";
import { useSceneReducer } from "../state/scene-store.js";
import { useGameSocket } from "../hooks/useGameSocket.js";
import { ControlPanel } from "../components/ControlPanel.js";
import { ModulePalette } from "../components/ModulePalette.js";
import { DesignPanel } from "../components/DesignPanel.js";
import { InstructionPanel, computeBuildSteps, type BuildStep } from "../components/InstructionPanel.js";
import { Brick, LEGO } from "../landing/primitives.js";
import type { BuildModule } from "../state/modules.js";

type Rotation = 0 | 90 | 180 | 270;
const ROTATIONS: Rotation[] = [0, 90, 180, 270];

/** Rotate a 2D offset around the module's anchor (origin) by the given Y-axis
 * angle in degrees. Z (height) is unchanged. Matches the visual rotation
 * applied to a single brick's group `rotation={[0, rad, 0]}`. */
function rotateOffset(
  offset: [number, number, number],
  deg: Rotation,
): [number, number, number] {
  const [x, y, z] = offset;
  switch (deg) {
    case 90:
      return [-y, x, z];
    case 180:
      return [-x, -y, z];
    case 270:
      return [y, -x, z];
    case 0:
    default:
      return [x, y, z];
  }
}

async function callTool(name: string, args: Record<string, unknown> = {}) {
  try {
    const res = await fetch("http://localhost:7788/api/tools/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, args }),
    });
    return res.json();
  } catch (e) {
    console.error("tool call failed", name, e);
  }
}

interface Props {
  track: Track;
  designName?: string;
  onExit: () => void;
}

export function GameScreen({ track, designName, onExit }: Props) {
  const [state, dispatch] = useSceneReducer();
  useGameSocket("ws://localhost:7788/ws", dispatch);

  const [selectedColor, setSelectedColor] = React.useState<string>("#FF0000");
  const [selectedBlockType, setSelectedBlockType] = React.useState<string>(
    track === "minecraft" ? "voxel_1x1" : "brick_1x1",
  );
  const [selectedModule, setSelectedModule] = React.useState<BuildModule | null>(null);
  const [selectedRotation, setSelectedRotation] = React.useState<Rotation>(0);
  const [instruction, setInstruction] = React.useState<{
    steps: BuildStep[];
    currentStep: number;
  } | null>(null);
  const [showBaseplate, setShowBaseplate] = React.useState<boolean>(true);
  const [showSky, setShowSky] = React.useState<boolean>(track === "minecraft");
  const [showGrid, setShowGrid] = React.useState<boolean>(false);
  const [toast, setToast] = React.useState<{ kind: "err" | "ok"; text: string } | null>(null);
  const toastTimer = React.useRef<number | null>(null);

  const accent = track === "lego" ? LEGO.red : LEGO.green;
  const modeLabel = track === "lego" ? "LEGO" : "Minecraft";

  const showToast = React.useCallback((kind: "err" | "ok", text: string) => {
    setToast({ kind, text });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  const placeAt = React.useCallback(
    async (position: [number, number, number]) => {
      if (selectedModule) {
        await callTool("record_user_intent", {
          text: `place module: ${selectedModule.id} (rot ${selectedRotation})`,
        });
        for (const part of selectedModule.parts) {
          const rotated = rotateOffset(part.offset, selectedRotation);
          const partPos: [number, number, number] = [
            position[0] + rotated[0],
            position[1] + rotated[1],
            position[2] + rotated[2],
          ];
          const res = await callTool("place_block", {
            track,
            type: part.type,
            position: partPos,
            color: part.color,
            rotation: selectedRotation,
          });
          if (res && res.ok === false && res.error) {
            showToast("err", `${selectedModule.ko}: ${res.error.code}`);
            return;
          }
        }
        showToast("ok", `${selectedModule.ko} 배치됨 · ${selectedModule.parts.length} blocks`);
        return;
      }

      await callTool("record_user_intent", { text: "UI click place" });
      const res = await callTool("place_block", {
        track,
        type: selectedBlockType,
        position,
        color: selectedColor,
        rotation: selectedRotation,
      });
      if (res && res.ok === false && res.error) {
        const { code, message } = res.error;
        if (code === "OVERLAP") {
          showToast("err", `겹침: ${message}`);
        } else if (code === "UNSUPPORTED_PLACEMENT") {
          showToast("err", `허공 — 받침이 필요해요`);
        } else {
          showToast("err", `${code}: ${message}`);
        }
      }
    },
    [track, selectedBlockType, selectedColor, selectedModule, selectedRotation, showToast],
  );

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" && selectedModule) {
        setSelectedModule(null);
        return;
      }
      // R cycles rotation 0 → 90 → 180 → 270 → 0. Skip the existing ControlPanel
      // shortcut for `r` (which selects brick_2x4) by using shiftKey OR by
      // checking that the user isn't holding plain `r` (we co-opt it: rotate
      // takes priority for LEGO since voxel_1x1 is symmetric anyway).
      if (e.key === "r" || e.key === "R") {
        // Avoid conflict with ControlPanel "r=brick_2x4" shortcut: only rotate
        // when Shift is held.
        if (!e.shiftKey) return;
        setSelectedRotation((r) => {
          const idx = ROTATIONS.indexOf(r);
          return ROTATIONS[(idx + 1) % ROTATIONS.length];
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedModule]);

  // Reset the scene on entry so leftover blocks don't bleed in from a previous
  // session. (No challenge binding — this is free-form design now.)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      await callTool("record_user_intent", { text: `start design` });
      if (cancelled) return;
      await callTool("reset_scene");
    })();
    return () => {
      cancelled = true;
    };
  }, [track]);

  const removeBlock = React.useCallback(
    async (block: Block) => {
      await callTool("record_user_intent", { text: "UI click remove" });
      const res = await callTool("remove_block", { block_id: block.id });
      if (res && res.ok === false && res.error) {
        showToast("err", `${res.error.code}: ${res.error.message}`);
      }
    },
    [showToast],
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#0e0c08",
        color: "#f6f4ef",
        fontFamily: '"Inter Tight","Pretendard",-apple-system,sans-serif',
      }}
    >
      {/* LEFT: 3D scene */}
      <main style={{ flex: 1, position: "relative", minWidth: 0, background: "#0e0c08" }}>
        <header
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: "14px 22px",
            background: "rgba(14,12,9,.85)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(246,244,239,.1)",
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          <button
            onClick={onExit}
            title="처음으로"
            style={topLinkStyle}
          >
            <span style={{ opacity: 0.5 }}>←</span> home
          </button>

          <div style={{ width: 1, height: 22, background: "rgba(246,244,239,.12)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Brick cols={2} rows={1} unit={12} color={accent} />
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".18em",
                color: accent,
              }}
            >
              {modeLabel.toUpperCase()}
            </div>
          </div>

          <div style={{ width: 1, height: 22, background: "rgba(246,244,239,.12)" }} />

          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10,
                color: "rgba(246,244,239,.5)",
                letterSpacing: ".15em",
              }}
            >
              DESIGN
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.01em" }}>
              {designName ?? "새 디자인"}
            </div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <StatusPill
              dotColor={state.connected ? "#25c25a" : "#c96442"}
              label={state.connected ? "connected" : "waiting"}
              mono
            />
            <StatusPill label={`${state.blocks.length} blocks`} mono />

            <div style={{ width: 1, height: 22, background: "rgba(246,244,239,.12)", margin: "0 4px" }} />

            <ChromeToggle active={showBaseplate} onClick={() => setShowBaseplate((v) => !v)} label="baseplate" />
            <ChromeToggle active={showSky} onClick={() => setShowSky((v) => !v)} label="sky" />
            <ChromeToggle active={showGrid} onClick={() => setShowGrid((v) => !v)} label="grid" />

            <ChromeToggle
              active={instruction !== null}
              label="instr"
              onClick={() => {
                if (instruction) {
                  setInstruction(null);
                } else {
                  const steps = computeBuildSteps(state.blocks);
                  if (steps.length === 0) {
                    showToast("err", "씬이 비어있어요 — 블록 먼저 쌓아주세요");
                    return;
                  }
                  setInstruction({ steps, currentStep: 0 });
                }
              }}
            />

            <div style={{ width: 1, height: 22, background: "rgba(246,244,239,.12)", margin: "0 4px" }} />

            <button
              onClick={onExit}
              title="랜딩으로 나가기"
              style={{
                ...chromeBtnBase,
                background: "transparent",
                border: "1px solid rgba(246,244,239,.18)",
                color: "rgba(246,244,239,.8)",
              }}
            >
              exit
            </button>
          </div>
        </header>

        <div style={{ position: "absolute", inset: 0, paddingTop: 54 }}>
          {(() => {
            const visibleBlocks = instruction
              ? instruction.steps
                  .slice(0, instruction.currentStep + 1)
                  .flatMap((s) => s.bricks)
              : state.blocks;
            // Highlight only THIS step's bricks (so user sees what's new).
            const highlightIds = instruction
              ? new Set(
                  instruction.steps[instruction.currentStep]?.bricks.map((b) => b.id) ?? [],
                )
              : undefined;
            // In instruction mode, click placement is disabled (read-only).
            const placeFn = instruction ? undefined : placeAt;
            const removeFn = instruction ? undefined : removeBlock;
            const modulePreview = selectedModule && !instruction
              ? selectedModule.parts.map((p) => ({
                  ...p,
                  offset: rotateOffset(p.offset, selectedRotation),
                }))
              : undefined;
            return track === "minecraft" ? (
              <VoxelScene
                blocks={visibleBlocks}
                selectedColor={selectedModule || instruction ? "" : selectedColor}
                selectedBlockType={selectedModule || instruction ? "" : selectedBlockType}
                modulePreviewParts={modulePreview}
                onPlaceBlock={placeFn}
                onRemoveBlock={removeFn}
                showBaseplate={showBaseplate}
                showSky={showSky}
                showGrid={showGrid}
                highlightIds={highlightIds}
              />
            ) : (
              <LegoScene
                bricks={visibleBlocks}
                selectedColor={selectedModule || instruction ? "" : selectedColor}
                selectedBlockType={selectedModule || instruction ? "" : selectedBlockType}
                selectedRotation={selectedRotation}
                modulePreviewParts={modulePreview}
                onPlaceBlock={placeFn}
                onRemoveBlock={removeFn}
                showBaseplate={showBaseplate}
                showSky={showSky}
                showGrid={showGrid}
                highlightIds={highlightIds}
              />
            );
          })()}
        </div>

        {state.blocks.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 5,
              background: "rgba(14,12,9,.9)",
              border: "1px solid rgba(246,244,239,.15)",
              color: "#f6f4ef",
              padding: "16px 22px",
              textAlign: "center",
              maxWidth: 560,
              pointerEvents: "none",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              채팅에서 집을 지어달라고 요청하세요
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 11.5,
                color: "rgba(246,244,239,.55)",
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: ".02em",
              }}
            >
              예: "빨간 지붕 5×5 집 지어줘" · 하단 툴로 색/블록 선택 후 좌클릭 배치 · 우클릭 제거
            </p>
          </div>
        )}

        {!instruction && (
          <>
            <ModulePalette
              track={track}
              selectedModuleId={selectedModule?.id ?? null}
              onSelect={setSelectedModule}
            />

            <ControlPanel
              track={track}
              selectedColor={selectedColor}
              selectedBlockType={selectedBlockType}
              selectedRotation={selectedRotation}
              onSelectColor={setSelectedColor}
              onSelectBlockType={setSelectedBlockType}
              onCycleRotation={() =>
                setSelectedRotation((r) => {
                  const idx = ROTATIONS.indexOf(r);
                  return ROTATIONS[(idx + 1) % ROTATIONS.length];
                })
              }
              moduleSelected={selectedModule !== null}
            />
          </>
        )}
        {instruction && (
          <InstructionPanel
            steps={instruction.steps}
            currentStep={instruction.currentStep}
            onStep={(n) => setInstruction((s) => (s ? { ...s, currentStep: n } : s))}
            onClose={() => setInstruction(null)}
          />
        )}
      </main>

      {/* RIGHT: design summary + parts list + instruction trigger */}
      <aside
        style={{
          width: 320,
          borderLeft: "1px solid rgba(246,244,239,.12)",
          background: "#1d1913",
          overflowY: "auto",
        }}
      >
        <DesignPanel
          blocks={state.blocks}
          designName={designName}
          onShowInstructions={() => {
            const steps = computeBuildSteps(state.blocks);
            if (steps.length === 0) {
              showToast("err", "씬이 비어있어요 — 블록 먼저 쌓아주세요");
              return;
            }
            setInstruction({ steps, currentStep: 0 });
          }}
          onReset={async () => {
            if (!confirm("정말 다 지울까요?")) return;
            await callTool("record_user_intent", { text: "user reset" });
            await callTool("reset_scene");
          }}
        />
      </aside>

      {toast ? (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "11px 20px",
            background: toast.kind === "err" ? "#c96442" : LEGO.green,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            letterSpacing: "-.005em",
            boxShadow: "0 12px 32px rgba(0,0,0,.4)",
            pointerEvents: "none",
            maxWidth: 520,
            textAlign: "center",
          }}
        >
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

const topLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#f6f4ef",
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 600,
  padding: 0,
};

const chromeBtnBase: React.CSSProperties = {
  padding: "6px 12px",
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  cursor: "pointer",
};

interface ChromeToggleProps {
  active: boolean;
  onClick: () => void;
  label: string;
}
const ChromeToggle: React.FC<ChromeToggleProps> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    style={{
      ...chromeBtnBase,
      background: active ? "rgba(246,244,239,.92)" : "transparent",
      color: active ? "#14110d" : "rgba(246,244,239,.6)",
      border: active
        ? "1px solid rgba(246,244,239,.92)"
        : "1px solid rgba(246,244,239,.18)",
    }}
  >
    {label}
  </button>
);

interface StatusPillProps {
  label: string;
  dotColor?: string;
  mono?: boolean;
}
const StatusPill: React.FC<StatusPillProps> = ({ label, dotColor, mono }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 10px",
      background: "rgba(246,244,239,.05)",
      border: "1px solid rgba(246,244,239,.1)",
      fontSize: 11,
      fontFamily: mono ? '"JetBrains Mono", monospace' : "inherit",
      color: "rgba(246,244,239,.75)",
      letterSpacing: ".02em",
    }}
  >
    {dotColor && (
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          background: dotColor,
        }}
      />
    )}
    {label}
  </span>
);
