import React from "react";
import type { ScoreReport } from "@blockgame/shared";
import { useSceneReducer } from "./state/scene-store.js";
import { useGameSocket } from "./hooks/useGameSocket.js";
import { ChallengeSelector } from "./components/ChallengeSelector.js";
import { InstructionLog } from "./components/InstructionLog.js";
import { ScoreReportModal } from "./components/ScoreReport.js";

export function App() {
  const [state, dispatch] = useSceneReducer();
  useGameSocket("ws://localhost:7788/ws", dispatch);
  const [challenge, setChallenge] = React.useState<string | null>(null);

  if (!challenge) return <ChallengeSelector onSelect={setChallenge} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <main style={{ flex: 1, padding: 24 }}>
        <h1>{challenge}</h1>
        <p>Connected: {state.connected ? "✅" : "⏳"}</p>
        <p>Blocks: {state.blocks.length}</p>
      </main>
      <InstructionLog turns={[]} />
      {state.report ? (
        <ScoreReportModal
          report={state.report as ScoreReport}
          onClose={() => { /* dispatch({ type: "clear_report" }) — future enhancement */ }}
        />
      ) : null}
    </div>
  );
}
