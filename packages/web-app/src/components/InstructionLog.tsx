import React from "react";
import type { Turn } from "@blockgame/shared";

export const InstructionLog: React.FC<{ turns: Turn[] }> = ({ turns }) => (
  <aside style={{ maxWidth: 340, borderLeft: "1px solid #333", padding: 12, overflowY: "auto" }}>
    <h3>Instructions</h3>
    {turns.length === 0 ? (
      <p style={{ opacity: 0.6 }}>아직 지시 없음</p>
    ) : (
      <ol>
        {turns.map(t =>
          <li key={t.turn_id}>
            <strong>{t.user_intent}</strong>
            <ul>{t.tool_calls.map((c, i) => <li key={i}>{c.tool_name}</li>)}</ul>
          </li>
        )}
      </ol>
    )}
  </aside>
);
