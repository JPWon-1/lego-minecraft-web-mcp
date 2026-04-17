import React from "react";

interface Props { onSelect: (id: string) => void }

export const ChallengeSelector: React.FC<Props> = ({ onSelect }) => {
  const items = [
    { id: "ch-001", title: "작은 오두막", difficulty: "easy" },
    { id: "ch-002", title: "회색 창고", difficulty: "easy" },
    { id: "ch-003", title: "2층 주택", difficulty: "medium" },
    { id: "ch-004", title: "탑", difficulty: "medium" },
    { id: "ch-005", title: "ㄱ자 별장", difficulty: "hard" },
  ];
  return (
    <div style={{ padding: 24 }}>
      <h2>챌린지 선택</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map(c =>
          <li key={c.id} style={{ margin: "8px 0" }}>
            <button onClick={() => onSelect(c.id)} style={{
              padding: "12px 20px",
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 16,
            }}>
              {c.title} ({c.difficulty})
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};
