import React from "react";
import { useSceneReducer } from "./state/scene-store.js";
import { useGameSocket } from "./hooks/useGameSocket.js";

export function App() {
  const [state, dispatch] = useSceneReducer();
  useGameSocket("ws://localhost:7788/ws", dispatch);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>AI Architect</h1>
      <p>Connected: {state.connected ? "✅" : "⏳ Waiting for Claude Code..."}</p>
      <p>Blocks: {state.blocks.length}</p>
    </div>
  );
}
