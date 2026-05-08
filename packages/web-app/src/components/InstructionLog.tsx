import React from "react";
import type { Turn } from "@blockgame/shared";

export const InstructionLog: React.FC<{ turns: Turn[] }> = ({ turns }) => (
  <div style={{ padding: 18 }}>
    <div
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10.5,
        letterSpacing: ".2em",
        color: "rgba(246,244,239,.5)",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      § INSTRUCTION LOG
    </div>
    {turns.length === 0 ? (
      <p
        style={{
          margin: 0,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          color: "rgba(246,244,239,.4)",
          letterSpacing: ".05em",
        }}
      >
        ⋮ 대화가 시작되면 여기 누적돼요.
      </p>
    ) : (
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {turns.map((t) => (
          <li
            key={t.turn_id}
            style={{
              padding: "10px 12px",
              border: "1px solid rgba(246,244,239,.12)",
              background: "#0e0c08",
            }}
          >
            <div style={{ fontSize: 13, color: "#f6f4ef", fontWeight: 600 }}>{t.user_intent}</div>
            {t.tool_calls.length > 0 && (
              <ul
                style={{
                  margin: "6px 0 0",
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                }}
              >
                {t.tool_calls.map((c, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "2px 8px",
                      background: "rgba(246,244,239,.06)",
                      border: "1px solid rgba(246,244,239,.1)",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 10.5,
                      color: "rgba(246,244,239,.75)",
                    }}
                  >
                    {c.tool_name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    )}
  </div>
);
