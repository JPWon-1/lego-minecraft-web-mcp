import React from "react";
import type { ChallengeManifest } from "@blockgame/shared";

interface Props {
  challengeId: string;
}

interface ChallengeData {
  manifest: ChallengeManifest;
  voxelTarget: {
    blocks: Array<{ pos: [number, number, number]; color: string; type: string }>;
  };
  specMd: string;
}

export const TargetDisplay: React.FC<Props> = ({ challengeId }) => {
  const [data, setData] = React.useState<ChallengeData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`http://localhost:7788/api/challenges/${challengeId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  if (error)
    return (
      <div style={pad}>
        <p style={{ color: "#ff7777" }}>챌린지 로드 실패: {error}</p>
      </div>
    );
  if (!data)
    return (
      <div style={pad}>
        <p>로딩 중...</p>
      </div>
    );

  const m = data.manifest;
  const imageUrl = `http://localhost:7788/challenges/${challengeIdToSlug(challengeId)}/${m.target_image}`;

  return (
    <div style={pad}>
      <h3 style={{ marginTop: 0 }}>🎯 목표</h3>
      <p style={{ fontSize: 13, margin: "4px 0 12px", opacity: 0.85 }}>
        <strong>{m.title}</strong> · {m.difficulty} · {m.mode}
        <br />
        <span style={{ fontSize: 11, opacity: 0.7 }}>
          grid {m.grid_size.join("×")} · ~{data.voxelTarget.blocks.length} blocks · ~
          {m.time_estimate_minutes}min
        </span>
      </p>

      {m.mode === "image" && (
        <div style={{ marginBottom: 12 }}>
          <img
            src={imageUrl}
            alt="target"
            style={{
              width: "100%",
              borderRadius: 4,
              border: "1px solid #444",
              background: "#222",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const fallback = (e.target as HTMLImageElement)
                .nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div
            style={{
              display: "none",
              padding: 24,
              background: "#222",
              borderRadius: 4,
              textAlign: "center",
              color: "#888",
            }}
          >
            (placeholder — 이미지 없음, 아래 설명 참고)
          </div>
        </div>
      )}

      {data.specMd && (
        <details open={m.mode === "text"} style={{ fontSize: 12 }}>
          <summary style={{ cursor: "pointer", marginBottom: 6 }}>
            📋 상세 스펙
          </summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#1a1a1a",
              padding: 10,
              borderRadius: 4,
              fontSize: 11,
              border: "1px solid #333",
            }}
          >
            {data.specMd}
          </pre>
        </details>
      )}

      <details style={{ marginTop: 12, fontSize: 11 }}>
        <summary style={{ cursor: "pointer" }}>💡 힌트 (페널티 있음)</summary>
        <ol style={{ marginTop: 6, paddingLeft: 20 }}>
          {m.hints.map((h) => (
            <li key={h.level} style={{ marginBottom: 4 }}>
              <strong>{h.level}</strong> (-{h.penalty}점): <em>{h.text}</em>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
};

const pad: React.CSSProperties = { padding: 12 };

function challengeIdToSlug(id: string): string {
  const map: Record<string, string> = {
    "ch-001": "001-small-cabin",
    "ch-002": "002-grey-shed",
    "ch-003": "003-two-story",
    "ch-004": "004-tower",
    "ch-005": "005-l-shaped-villa",
  };
  return map[id] ?? id;
}
