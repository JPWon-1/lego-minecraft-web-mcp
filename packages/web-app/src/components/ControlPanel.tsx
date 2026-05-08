import React from "react";
import type { Track } from "@blockgame/shared";

const COLORS = [
  { hex: "#FFFFFF", name: "White", key: "1" },
  { hex: "#000000", name: "Black", key: "2" },
  { hex: "#808080", name: "Grey", key: "3" },
  { hex: "#FF0000", name: "Red", key: "4" },
  { hex: "#FFA500", name: "Orange", key: "5" },
  { hex: "#FFFF00", name: "Yellow", key: "6" },
  { hex: "#00FF00", name: "Green", key: "7" },
  { hex: "#0066FF", name: "Blue", key: "8" },
  { hex: "#800080", name: "Purple", key: "9" },
  { hex: "#8B4513", name: "Brown", key: "0" },
];

const LEGO_BLOCKS = [
  { type: "brick_1x1", name: "1×1", key: "q" },
  { type: "brick_1x2", name: "1×2", key: "w" },
  { type: "brick_2x2", name: "2×2", key: "e" },
  { type: "brick_2x4", name: "2×4", key: "r" },
  { type: "brick_1x8", name: "1×8", key: "t" },
  { type: "slope_2x2", name: "Slope", key: "y" },
  { type: "window_1x2", name: "Window", key: "u" },
  { type: "door_1x3", name: "Door", key: "i" },
];

const MINECRAFT_BLOCKS = [{ type: "voxel_1x1", name: "Voxel 1×1", key: "q" }];

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
  selectedColor: string;
  selectedBlockType: string;
  selectedRotation?: 0 | 90 | 180 | 270;
  onSelectColor: (hex: string) => void;
  onSelectBlockType: (type: string) => void;
  onCycleRotation?: () => void;
  onSubmit?: () => void | Promise<void>;
  moduleSelected?: boolean;
}

const ROTATABLE_TYPES = new Set([
  "brick_1x2",
  "brick_2x4",
  "brick_1x8",
  "slope_1x2",
  "slope_2x2",
  "window_1x2",
  "door_1x3",
]);

export const ControlPanel: React.FC<Props> = ({
  track,
  selectedColor,
  selectedBlockType,
  selectedRotation = 0,
  onSelectColor,
  onSelectBlockType,
  onCycleRotation,
  onSubmit,
  moduleSelected,
}) => {
  const blocks = track === "minecraft" ? MINECRAFT_BLOCKS : LEGO_BLOCKS;
  const [hoverHelp, setHoverHelp] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      const color = COLORS.find((c) => c.key === k);
      if (color) {
        onSelectColor(color.hex);
        return;
      }
      const b = blocks.find((x) => x.key === k);
      if (b) onSelectBlockType(b.type);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [blocks, onSelectColor, onSelectBlockType]);

  const selectedColorName =
    COLORS.find((c) => c.hex.toUpperCase() === selectedColor.toUpperCase())?.name ??
    selectedColor;
  const selectedBlockName =
    blocks.find((b) => b.type === selectedBlockType)?.name ?? selectedBlockType;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 20,
        background: "rgba(14,12,9,.92)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(246,244,239,.12)",
        padding: "12px 18px",
        color: "#f6f4ef",
        fontSize: 12,
        fontFamily: '"Inter Tight","Pretendard",-apple-system,sans-serif',
        display: "flex",
        gap: 22,
        alignItems: "center",
        flexWrap: "wrap",
        boxShadow: "0 12px 40px rgba(0,0,0,.5)",
      }}
    >
      <Section label="Color" accent="#E4202B" dim={moduleSelected}>
        <div style={{ display: "flex", gap: 4 }}>
          {COLORS.map((c) => {
            const isSelected = c.hex.toUpperCase() === selectedColor.toUpperCase();
            return (
              <div
                key={c.hex}
                title={`${c.name} — ${c.hex} (key: ${c.key})`}
                onClick={() => onSelectColor(c.hex)}
                onMouseEnter={() =>
                  setHoverHelp(`"${c.name}" (${c.hex}) · key ${c.key}`)
                }
                onMouseLeave={() => setHoverHelp(null)}
                style={{
                  position: "relative",
                  width: 22,
                  height: 22,
                  background: c.hex,
                  border: isSelected
                    ? "1px solid #f6f4ef"
                    : "1px solid rgba(246,244,239,.18)",
                  cursor: "pointer",
                  transition: "transform .08s",
                  transform: isSelected ? "translateY(-2px)" : "none",
                  boxShadow: isSelected
                    ? "0 3px 0 rgba(0,0,0,.45), inset 0 -2px 0 rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.25)"
                    : "inset 0 -2px 0 rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.18)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    right: 1,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 8,
                    color: "rgba(20,17,13,.9)",
                    background: "rgba(246,244,239,.92)",
                    padding: "0 3px",
                    lineHeight: 1.2,
                  }}
                >
                  {c.key}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section label={track === "minecraft" ? "Voxel" : "Brick"} accent="#006CB7" dim={moduleSelected}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {blocks.map((b) => {
            const isSelected = b.type === selectedBlockType;
            return (
              <button
                key={b.type}
                title={`${b.type} (key: ${b.key})`}
                onClick={() => onSelectBlockType(b.type)}
                onMouseEnter={() => setHoverHelp(`type="${b.type}" · key ${b.key}`)}
                onMouseLeave={() => setHoverHelp(null)}
                style={{
                  padding: "5px 10px",
                  background: isSelected
                    ? "rgba(246,244,239,.92)"
                    : "transparent",
                  color: isSelected ? "#14110d" : "rgba(246,244,239,.78)",
                  border: isSelected
                    ? "1px solid rgba(246,244,239,.92)"
                    : "1px solid rgba(246,244,239,.18)",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer",
                  transition: "background .1s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {b.name}
                <span style={{ opacity: 0.5, fontSize: 9 }}>{b.key}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {onCycleRotation && (() => {
        // Rotation is meaningful when:
        //  (a) a directional brick type is picked (1×2, 2×4, slope, etc.), OR
        //  (b) a module is picked (rotates its whole footprint).
        const canRotate =
          (moduleSelected ?? false) ||
          ROTATABLE_TYPES.has(selectedBlockType);
        return (
          <Section label="Rotate" accent="#FE8A18">
            <button
              onClick={onCycleRotation}
              disabled={!canRotate}
              title="회전 (Shift+R)"
              style={{
                padding: "5px 10px",
                background: selectedRotation !== 0
                  ? "rgba(254,138,24,.18)"
                  : "transparent",
                color: canRotate
                  ? "rgba(246,244,239,.85)"
                  : "rgba(246,244,239,.3)",
                border: "1px solid rgba(246,244,239,.18)",
                cursor: canRotate ? "pointer" : "default",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".08em",
                minWidth: 56,
                textAlign: "center",
              }}
            >
              {selectedRotation}°
            </button>
          </Section>
        );
      })()}

      <Section label="Action" accent="#FFCD00">
        <div style={{ display: "flex", gap: 4 }}>
          <ActionButton
            label="Undo"
            onClick={async () => {
              await callTool("record_user_intent", { text: "undo" });
              await callTool("undo");
            }}
          />
          <ActionButton
            label="Reset"
            onClick={async () => {
              if (!confirm("씬을 전부 리셋하시겠어요?")) return;
              await callTool("record_user_intent", { text: "reset scene" });
              await callTool("reset_scene");
            }}
          />
        </div>
      </Section>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 3,
          fontSize: 11,
          minWidth: 220,
          textAlign: "right",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              color: "rgba(246,244,239,.5)",
              letterSpacing: ".18em",
            }}
          >
            SELECTED
          </span>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              background: selectedColor,
              border: "1px solid rgba(246,244,239,.2)",
            }}
          />
          <span style={{ fontWeight: 600 }}>
            {selectedColorName}{" "}
            <span style={{ color: "rgba(246,244,239,.55)", fontFamily: '"JetBrains Mono", monospace', fontSize: 10 }}>
              · {selectedBlockName}
            </span>
          </span>
        </div>
        <div
          style={{
            color: moduleSelected ? "#E4202B" : "rgba(246,244,239,.55)",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10.5,
            letterSpacing: ".02em",
            fontWeight: moduleSelected ? 700 : 400,
          }}
        >
          {moduleSelected
            ? "▸ MODULE ACTIVE · click to place · ESC to cancel"
            : (hoverHelp ?? '▸ "빨간 지붕 5×5 집 지어줘" 같은 문장도 OK')}
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
  label: string;
  accent: string;
  children: React.ReactNode;
  dim?: boolean;
}

const Section: React.FC<SectionProps> = ({ label, accent, children, dim }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      borderLeft: "1px solid rgba(246,244,239,.12)",
      paddingLeft: 14,
      opacity: dim ? 0.35 : 1,
      transition: "opacity .2s",
    }}
  >
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: ".18em",
        color: "rgba(246,244,239,.7)",
        textTransform: "uppercase",
      }}
    >
      <span style={{ width: 6, height: 6, background: accent, flexShrink: 0 }} />
      {label}
    </span>
    {children}
  </div>
);

interface ActionButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  primary?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, primary }) => {
  const [hover, setHover] = React.useState(false);
  if (primary) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          padding: "6px 14px",
          background: "#E4202B",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          boxShadow: hover
            ? "0 1px 0 #8d1018, inset 0 2px 0 rgba(255,255,255,.2)"
            : "0 3px 0 #8d1018, inset 0 2px 0 rgba(255,255,255,.2)",
          transform: hover ? "translateY(2px)" : "none",
          transition: "all .08s ease",
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "5px 10px",
        background: hover ? "rgba(246,244,239,.08)" : "transparent",
        color: "rgba(246,244,239,.85)",
        border: "1px solid rgba(246,244,239,.18)",
        cursor: "pointer",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".06em",
        transition: "background .1s",
      }}
    >
      {label}
    </button>
  );
};
