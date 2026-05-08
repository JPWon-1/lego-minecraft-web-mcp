import React from "react";
import type { Block } from "@blockgame/shared";

export interface BuildStep {
  bricks: Block[];
  zLevel: number;
  label: string; // "z=2 · 8 blocks"
}

const MAX_PER_STEP = 10;

const TYPE_KO: Record<string, string> = {
  brick_1x1: "1×1",
  brick_1x2: "1×2",
  brick_2x2: "2×2",
  brick_2x4: "2×4",
  brick_1x8: "1×8",
  voxel_1x1: "복셀",
  slope_1x2: "슬로프 1×2",
  slope_2x2: "슬로프 2×2",
  window_1x2: "창문 1×2",
  window_2x2: "창문 2×2",
  door_1x3: "도어",
  baseplate_16x16: "베이스",
};

const COLOR_KO: Record<string, string> = {
  "#E4202B": "빨강",
  "#FF0000": "빨강",
  "#FFCD00": "노랑",
  "#FFFF00": "노랑",
  "#006CB7": "파랑",
  "#0066FF": "파랑",
  "#00852B": "초록",
  "#00FF00": "초록",
  "#F5F4EF": "흰색",
  "#FFFFFF": "흰색",
  "#14110D": "검정",
  "#000000": "검정",
  "#9AA0A5": "회색",
  "#808080": "회색",
  "#FE8A18": "주황",
  "#FFA500": "주황",
  "#8B4513": "갈색",
  "#FF66B2": "분홍",
  "#800080": "보라",
};

function colorName(hex: string): string {
  return COLOR_KO[hex.toUpperCase()] ?? hex;
}
function typeName(t: string): string {
  return TYPE_KO[t] ?? t;
}

export interface PartCount {
  type: string;
  color: string;
  count: number;
}

export function partsList(bricks: Block[]): PartCount[] {
  const map = new Map<string, PartCount>();
  for (const b of bricks) {
    const key = `${b.type}|${b.color.toUpperCase()}`;
    const cur = map.get(key);
    if (cur) cur.count++;
    else map.set(key, { type: b.type, color: b.color.toUpperCase(), count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Group all blocks into LEGO-manual-style steps: lower Z first, split into
 * sub-steps when a layer is too large. Within a layer, sort by placement
 * timestamp so the build order is preserved. */
export function computeBuildSteps(blocks: Block[]): BuildStep[] {
  if (!blocks.length) return [];
  const byZ = new Map<number, Block[]>();
  for (const b of blocks) {
    const z = b.position[2];
    if (!byZ.has(z)) byZ.set(z, []);
    byZ.get(z)!.push(b);
  }
  const steps: BuildStep[] = [];
  const zLevels = [...byZ.keys()].sort((a, b) => a - b);
  for (const z of zLevels) {
    const group = byZ.get(z)!;
    group.sort((a, b) => (a.placed_at ?? 0) - (b.placed_at ?? 0));
    for (let i = 0; i < group.length; i += MAX_PER_STEP) {
      const slice = group.slice(i, i + MAX_PER_STEP);
      const partN = Math.ceil(group.length / MAX_PER_STEP);
      const part = Math.floor(i / MAX_PER_STEP) + 1;
      const label =
        partN > 1
          ? `층 z=${z}  ·  ${slice.length} blocks  (${part}/${partN})`
          : `층 z=${z}  ·  ${slice.length} blocks`;
      steps.push({ bricks: slice, zLevel: z, label });
    }
  }
  return steps;
}

interface Props {
  steps: BuildStep[];
  currentStep: number;
  onStep: (next: number) => void;
  onClose: () => void;
}

export const InstructionPanel: React.FC<Props> = ({
  steps,
  currentStep,
  onStep,
  onClose,
}) => {
  const [autoPlay, setAutoPlay] = React.useState(false);

  React.useEffect(() => {
    if (!autoPlay) return;
    if (currentStep >= steps.length - 1) {
      setAutoPlay(false);
      return;
    }
    const t = window.setTimeout(() => onStep(currentStep + 1), 1100);
    return () => window.clearTimeout(t);
  }, [autoPlay, currentStep, steps.length, onStep]);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") onStep(Math.min(steps.length - 1, currentStep + 1));
      else if (e.key === "ArrowLeft") onStep(Math.max(0, currentStep - 1));
      else if (e.key === " ") {
        e.preventDefault();
        setAutoPlay((v) => !v);
      } else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [steps.length, currentStep, onStep, onClose]);

  const step = steps[currentStep];
  const totalBricks = steps.reduce((acc, s) => acc + s.bricks.length, 0);
  const placedSoFar = steps
    .slice(0, currentStep + 1)
    .reduce((acc, s) => acc + s.bricks.length, 0);
  const progress = totalBricks ? placedSoFar / totalBricks : 0;
  const stepParts = step ? partsList(step.bricks) : [];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 25,
        background: "rgba(14,12,9,.94)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(246,244,239,.18)",
        padding: "14px 18px",
        color: "#f6f4ef",
        fontFamily: '"Inter Tight","Pretendard",-apple-system,sans-serif',
        boxShadow: "0 12px 40px rgba(0,0,0,.55)",
        display: "flex",
        gap: 18,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* STEP NUMBER — large, LEGO-instruction style */}
      <div
        style={{
          padding: "8px 16px",
          background: "#FFCD00",
          color: "#14110d",
          minWidth: 96,
          textAlign: "center",
          fontFamily: '"Inter Tight", sans-serif',
          letterSpacing: "-.02em",
          flexShrink: 0,
        }}
      >
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 800, letterSpacing: ".22em" }}>
          STEP
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
          {currentStep + 1}
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, opacity: 0.7 }}>
          / {steps.length}
        </div>
      </div>

      {/* PARTS CALLOUT — what to grab this step */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 240, flex: "1 1 320px" }}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9.5,
            letterSpacing: ".2em",
            color: "rgba(246,244,239,.5)",
            textTransform: "uppercase",
          }}
        >
          이 단계 부품  ·  {step?.label}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {stepParts.map((p) => (
            <div
              key={`${p.type}|${p.color}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px 4px 4px",
                background: "rgba(246,244,239,.06)",
                border: "1px solid rgba(246,244,239,.14)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  background: p.color,
                  border: "1px solid rgba(0,0,0,.35)",
                  boxShadow: "inset 0 -2px 0 rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.18)",
                }}
              />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, fontWeight: 700, color: "#FFCD00" }}>
                ×{p.count}
              </span>
              <span style={{ fontSize: 11.5, color: "rgba(246,244,239,.85)" }}>
                {typeName(p.type)} {colorName(p.color)}
              </span>
            </div>
          ))}
          {!stepParts.length && (
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: "rgba(246,244,239,.4)" }}>
              (empty step)
            </span>
          )}
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180, flex: "1 1 200px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            color: "rgba(246,244,239,.55)",
            letterSpacing: ".1em",
          }}
        >
          <span>{placedSoFar} placed</span>
          <span>{totalBricks} total</span>
        </div>
        <div style={{ height: 6, background: "rgba(246,244,239,.12)", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              right: `${(1 - progress) * 100}%`,
              background: "#E4202B",
              transition: "right .25s ease",
            }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={currentStep}
          onChange={(e) => onStep(Number(e.target.value))}
          style={{ accentColor: "#E4202B", marginTop: 2 }}
        />
      </div>

      {/* CONTROLS */}
      <div style={{ display: "flex", gap: 6 }}>
        <NavBtn label="◀◀" onClick={() => onStep(0)} disabled={currentStep === 0} />
        <NavBtn label="◀" onClick={() => onStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} />
        <NavBtn
          label={autoPlay ? "⏸" : "▶"}
          onClick={() => setAutoPlay((v) => !v)}
          primary
        />
        <NavBtn
          label="▶"
          onClick={() => onStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep >= steps.length - 1}
        />
        <NavBtn
          label="▶▶"
          onClick={() => onStep(steps.length - 1)}
          disabled={currentStep >= steps.length - 1}
        />
      </div>

      <button
        onClick={onClose}
        title="Esc"
        style={{
          padding: "8px 14px",
          background: "transparent",
          color: "rgba(246,244,239,.85)",
          border: "1px solid rgba(246,244,239,.25)",
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".1em",
          cursor: "pointer",
        }}
      >
        EXIT
      </button>
    </div>
  );
};

interface NavBtnProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}
const NavBtn: React.FC<NavBtnProps> = ({ label, onClick, disabled, primary }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "8px 12px",
      background: primary
        ? "#E4202B"
        : disabled
          ? "transparent"
          : "rgba(246,244,239,.06)",
      color: disabled ? "rgba(246,244,239,.25)" : primary ? "#fff" : "rgba(246,244,239,.85)",
      border: primary ? "none" : `1px solid rgba(246,244,239,${disabled ? ".1" : ".2"})`,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: ".05em",
      cursor: disabled ? "default" : "pointer",
      minWidth: 40,
    }}
  >
    {label}
  </button>
);
