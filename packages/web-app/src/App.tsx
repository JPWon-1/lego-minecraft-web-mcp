import React from "react";
import type { ScoreReport, Track } from "@blockgame/shared";
import { VoxelScene } from "@blockgame/renderer-minecraft";
import { LegoScene } from "@blockgame/renderer-lego";
import { useSceneReducer } from "./state/scene-store.js";
import { useGameSocket } from "./hooks/useGameSocket.js";
import { ChallengeSelector } from "./components/ChallengeSelector.js";
import { InstructionLog } from "./components/InstructionLog.js";
import { ScoreReportModal } from "./components/ScoreReport.js";
import { TargetDisplay } from "./components/TargetDisplay.js";

export function App() {
  const [state, dispatch] = useSceneReducer();
  useGameSocket("ws://localhost:7788/ws", dispatch);
  const [challenge, setChallenge] = React.useState<string | null>(null);
  const [track, setTrack] = React.useState<Track>("minecraft");

  if (!challenge) return <ChallengeSelector onSelect={setChallenge} />;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* LEFT: 3D scene */}
      <main
        style={{
          flex: 1,
          position: "relative",
          background: "#2a2a2a",
          minWidth: 0,
        }}
      >
        <header
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: "12px 20px",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            gap: 16,
            alignItems: "center",
            color: "#fff",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>
            🏗️ <code>{challenge}</code>
          </h2>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, opacity: 0.8 }}>
              {state.connected ? "🟢 connected" : "🔴 waiting"} ·{" "}
              {state.blocks.length} blocks
            </span>
            <button
              onClick={() =>
                setTrack(track === "minecraft" ? "lego" : "minecraft")
              }
              style={btnStyle}
            >
              {track === "minecraft" ? "🟫 Minecraft" : "🧱 LEGO"} (switch)
            </button>
            <button
              onClick={() => setChallenge(null)}
              style={{
                ...btnStyle,
                background: "#552222",
                borderColor: "#884444",
              }}
            >
              ← Exit
            </button>
          </div>
        </header>

        <div style={{ position: "absolute", inset: 0, paddingTop: 50 }}>
          {track === "minecraft" ? (
            <VoxelScene blocks={state.blocks} />
          ) : (
            <LegoScene bricks={state.blocks} />
          )}
        </div>

        {state.blocks.length === 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: 8,
              textAlign: "center",
              maxWidth: 520,
              pointerEvents: "none",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
              ⚡ Claude Code 터미널에서 지시하세요
            </p>
            <code
              style={{
                display: "block",
                marginTop: 6,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              claude mcp add blockgame -- npx blockgame-mcp
            </code>
          </div>
        )}
      </main>

      {/* RIGHT: target display + instruction log */}
      <aside
        style={{
          width: 320,
          borderLeft: "1px solid #333",
          background: "#1d1d1d",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
        }}
      >
        <TargetDisplay challengeId={challenge} />
        <div style={{ borderTop: "1px solid #333", flex: 1 }}>
          <InstructionLog turns={[]} />
        </div>
      </aside>

      {state.report ? (
        <ScoreReportModal
          report={state.report as ScoreReport}
          onClose={() => {
            /* future enhancement */
          }}
        />
      ) : null}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: "#444",
  color: "#fff",
  border: "1px solid #666",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
};
