import React from "react";
import type { Track } from "@blockgame/shared";
import { BuildModule, ModuleCategory, modulesForTrack } from "../state/modules.js";

interface Props {
  track: Track;
  selectedModuleId: string | null;
  onSelect: (module: BuildModule | null) => void;
}

const CATEGORY_LABEL: Record<ModuleCategory, string> = {
  window: "WINDOW",
  door: "DOOR",
  roof: "ROOF",
  structural: "STRUCTURE",
  nature: "NATURE",
};

export const ModulePalette: React.FC<Props> = ({ track, selectedModuleId, onSelect }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const modules = modulesForTrack(track);

  // Group by category preserving first-seen order.
  const groups = React.useMemo(() => {
    const map = new Map<ModuleCategory, BuildModule[]>();
    for (const m of modules) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return Array.from(map.entries());
  }, [modules]);

  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        top: 72,
        bottom: 92,
        width: collapsed ? 44 : 200,
        zIndex: 15,
        background: "rgba(14,12,9,.92)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(246,244,239,.12)",
        color: "#f6f4ef",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 12px 40px rgba(0,0,0,.5)",
        fontFamily: '"Inter Tight","Pretendard",-apple-system,sans-serif',
        transition: "width .18s ease",
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "10px 0" : "10px 12px",
          borderBottom: "1px solid rgba(246,244,239,.1)",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".22em",
              color: "rgba(246,244,239,.7)",
            }}
          >
            MODULES · {modules.length}
          </span>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "expand" : "collapse"}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(246,244,239,.6)",
            cursor: "pointer",
            fontSize: 14,
            padding: "2px 6px",
            fontFamily: "inherit",
          }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {collapsed ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            letterSpacing: ".2em",
            color: "rgba(246,244,239,.5)",
          }}
        >
          MODULES
        </div>
      ) : (
        <>
          {/* selected indicator */}
          {selectedModuleId && (
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid rgba(246,244,239,.1)",
                background: "rgba(228,32,43,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 10,
                  letterSpacing: ".15em",
                  color: "#E4202B",
                  fontWeight: 700,
                }}
              >
                ▸ PICKED · click scene
              </span>
              <button
                onClick={() => onSelect(null)}
                title="deselect (ESC)"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(246,244,239,.2)",
                  color: "rgba(246,244,239,.75)",
                  cursor: "pointer",
                  fontSize: 10,
                  padding: "2px 6px",
                  fontFamily: '"JetBrains Mono", monospace',
                  letterSpacing: ".1em",
                }}
              >
                ESC
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px 14px" }}>
            {groups.map(([cat, list]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 9.5,
                    fontWeight: 800,
                    letterSpacing: ".22em",
                    color: "rgba(246,244,239,.45)",
                    padding: "2px 4px 8px",
                  }}
                >
                  {CATEGORY_LABEL[cat]}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                  }}
                >
                  {list.map((m) => (
                    <ModuleCard
                      key={m.id}
                      module={m}
                      active={selectedModuleId === m.id}
                      onClick={() =>
                        onSelect(selectedModuleId === m.id ? null : m)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid rgba(246,244,239,.1)",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9.5,
              color: "rgba(246,244,239,.4)",
              letterSpacing: ".08em",
              flexShrink: 0,
            }}
          >
            ▸ 선택 후 씬 좌클릭 배치
          </div>
        </>
      )}
    </div>
  );
};

interface ModuleCardProps {
  module: BuildModule;
  active: boolean;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module: m, active, onClick }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${m.name} · ${m.parts.length} blocks`}
      style={{
        padding: 8,
        background: active ? "rgba(246,244,239,.1)" : "transparent",
        border: active
          ? `1px solid ${m.accent}`
          : hover
            ? "1px solid rgba(246,244,239,.25)"
            : "1px solid rgba(246,244,239,.1)",
        cursor: "pointer",
        fontFamily: "inherit",
        color: "#f6f4ef",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "all .12s",
      }}
    >
      <ModulePreview module={m} size={72} />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "-.005em",
            lineHeight: 1.2,
          }}
        >
          {m.ko}
        </div>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9.5,
            color: "rgba(246,244,239,.5)",
            letterSpacing: ".05em",
          }}
        >
          {m.parts.length} · {m.size[0]}×{m.size[1]}×{m.size[2]}
        </div>
      </div>
    </button>
  );
};

interface PreviewProps {
  module: BuildModule;
  size: number;
}

/** Front elevation view (XZ plane, Y depth collapsed). Works for modules
 * whose interesting silhouette lies on Z-vertical axis. For XY-flat modules
 * (grass patch, pool) we fall back to a top-down (XY) view automatically. */
const ModulePreview: React.FC<PreviewProps> = ({ module: m, size }) => {
  const topDown = m.size[2] <= 1;
  const cols = m.size[0];
  const rows = topDown ? m.size[1] : m.size[2];
  const unit = Math.min(size / cols, size / rows);
  const w = cols * unit;
  const h = rows * unit;

  const dedup = new Map<string, string>();
  for (const p of m.parts) {
    const key = topDown ? `${p.offset[0]},${p.offset[1]}` : `${p.offset[0]},${p.offset[2]}`;
    if (!dedup.has(key)) dedup.set(key, p.color);
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(246,244,239,.04)",
      }}
    >
      <div style={{ position: "relative", width: w, height: h }}>
        {Array.from(dedup.entries()).map(([key, color]) => {
          const [a, b] = key.split(",").map(Number);
          const col = a;
          const row = b;
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: col * unit,
                bottom: row * unit,
                width: unit,
                height: unit,
                background: color,
                boxShadow:
                  "inset 0 -2px 0 rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.16)",
                border: "1px solid rgba(0,0,0,.2)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
