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

const DIFF_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  easy: { label: "EASY", bg: "#00852B", fg: "#fff" },
  medium: { label: "MEDIUM", bg: "#FFCD00", fg: "#14110d" },
  hard: { label: "HARD", bg: "#E4202B", fg: "#fff" },
};

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

  if (error) {
    return (
      <div style={pad}>
        <p style={{ color: "#f08b78", fontSize: 13, margin: 0 }}>
          챌린지 로드 실패: {error}
        </p>
      </div>
    );
  }
  if (!data) {
    return (
      <div style={pad}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            color: "rgba(246,244,239,.5)",
            letterSpacing: ".1em",
          }}
        >
          loading…
        </div>
      </div>
    );
  }

  const m = data.manifest;
  const imageUrl = `http://localhost:7788/challenges/${challengeIdToSlug(challengeId)}/${m.target_image}`;
  const diff = DIFF_LABEL[m.difficulty] ?? DIFF_LABEL.easy;

  return (
    <div style={pad}>
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
        § TARGET
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h3
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-.02em",
            color: "#f6f4ef",
          }}
        >
          {m.title}
        </h3>
        <span
          style={{
            padding: "3px 8px",
            background: diff.bg,
            color: diff.fg,
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: ".18em",
          }}
        >
          {diff.label}
        </span>
      </div>
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          color: "rgba(246,244,239,.6)",
          marginTop: 6,
          letterSpacing: ".02em",
        }}
      >
        grid {m.grid_size.join("×")} · ~{data.voxelTarget.blocks.length} blocks · ~
        {m.time_estimate_minutes}min · {m.mode}
      </div>

      {m.mode === "image" && (
        <div style={{ marginTop: 14 }}>
          <img
            src={imageUrl}
            alt="target"
            style={{
              width: "100%",
              display: "block",
              border: "1px solid rgba(246,244,239,.12)",
              background: "#0e0c08",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div
            style={{
              display: "none",
              padding: "16px 14px",
              background: "#0e0c08",
              border: "1px solid rgba(246,244,239,.12)",
              color: "rgba(246,244,239,.65)",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10,
                letterSpacing: ".15em",
                color: "#FFCD00",
                marginBottom: 6,
              }}
            >
              ▸ IMAGE PENDING
            </div>
            타겟 이미지가 아직 준비 안 됐어요. 아래 <strong style={{ color: "#f6f4ef" }}>SPEC</strong>의 글로 된 설명을 참고하세요.
          </div>
        </div>
      )}

      {data.specMd && (
        <details
          open
          style={{ fontSize: 12, marginTop: 14, cursor: "pointer" }}
        >
          <summary
            style={{
              listStyle: "none",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10.5,
              letterSpacing: ".18em",
              color: "rgba(246,244,239,.7)",
              textTransform: "uppercase",
              padding: "6px 0",
            }}
          >
            ▸ spec
          </summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#0e0c08",
              padding: 12,
              marginTop: 6,
              marginBottom: 0,
              fontSize: 11,
              fontFamily: '"JetBrains Mono", monospace',
              border: "1px solid rgba(246,244,239,.12)",
              color: "rgba(246,244,239,.82)",
              lineHeight: 1.55,
            }}
          >
            {data.specMd}
          </pre>
        </details>
      )}

      <details style={{ marginTop: 10, fontSize: 11, cursor: "pointer" }}>
        <summary
          style={{
            listStyle: "none",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10.5,
            letterSpacing: ".18em",
            color: "rgba(246,244,239,.7)",
            textTransform: "uppercase",
            padding: "6px 0",
          }}
        >
          ▸ hints <span style={{ color: "rgba(246,244,239,.4)", letterSpacing: ".05em" }}>(penalty)</span>
        </summary>
        <ol style={{ margin: "6px 0 0", paddingLeft: 0, listStyle: "none" }}>
          {m.hints.map((h) => (
            <li
              key={h.level}
              style={{
                display: "flex",
                gap: 10,
                padding: "8px 10px",
                border: "1px solid rgba(246,244,239,.1)",
                marginBottom: 6,
                fontSize: 12,
                lineHeight: 1.5,
                color: "rgba(246,244,239,.85)",
              }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  color: "#FFCD00",
                  flexShrink: 0,
                }}
              >
                L{h.level} −{h.penalty}
              </span>
              <span>{h.text}</span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
};

const pad: React.CSSProperties = { padding: 18 };

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
