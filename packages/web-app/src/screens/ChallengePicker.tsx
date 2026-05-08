import React from "react";
import type { Track } from "@blockgame/shared";
import { Brick, StudField, LEGO } from "../landing/primitives.js";
import { CHALLENGES } from "../landing/data.js";
import { ChallengeCard } from "../landing/ChallengeCard.js";

interface Props {
  dark: boolean;
  track: Track;
  onBack: () => void;
  onSelect: (challengeId: string) => void;
}

export const ChallengePicker: React.FC<Props> = ({ dark, track, onBack, onSelect }) => {
  const bg = dark ? "#14110d" : "#f2ece0";
  const ink = dark ? "#f6f4ef" : "#14110d";
  const dim = dark ? "rgba(246,244,239,.6)" : "rgba(20,17,13,.62)";
  const line = dark ? "rgba(246,244,239,.14)" : "rgba(20,17,13,.12)";
  const panel = dark ? "#1d1913" : "#f8f4ea";

  const accent = track === "lego" ? LEGO.red : LEGO.green;
  const modeLabel = track === "lego" ? "LEGO" : "Minecraft";

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: bg,
        color: ink,
        fontFamily: '"Inter Tight","Pretendard",-apple-system,sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: dark ? 0.25 : 0.5 }}>
        <StudField
          unit={30}
          color={bg}
          dot={dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.055)"}
        />
      </div>

      {/* Top bar */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          padding: "22px 56px",
          borderBottom: `1px solid ${line}`,
          gap: 18,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: ink,
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 600,
            padding: 0,
          }}
        >
          <span style={{ opacity: 0.5 }}>←</span> mode
        </button>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "5px 12px",
            background: accent,
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".18em",
          }}
        >
          <Brick cols={1} rows={1} unit={10} color={accent} />
          <span>{modeLabel.toUpperCase()} SELECTED</span>
        </div>

        <div style={{ flex: 1 }} />
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            letterSpacing: ".2em",
            color: dim,
            textTransform: "uppercase",
          }}
        >
          Step 2 of 2 · Pick a build
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "56px 56px 96px",
          display: "flex",
          flexDirection: "column",
          gap: 36,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              color: dim,
              letterSpacing: ".2em",
              marginBottom: 10,
            }}
          >
            § CHALLENGE GALLERY · {CHALLENGES.length} BUILDS
          </div>
          <h1
            style={{
              fontSize: "clamp(44px, 5vw, 64px)",
              letterSpacing: "-.02em",
              lineHeight: 1,
              fontWeight: 800,
              margin: 0,
            }}
          >
            뭘 지어볼까요?
          </h1>
          <p style={{ color: dim, fontSize: 16, marginTop: 14, maxWidth: 620, lineHeight: 1.5 }}>
            카드를 클릭하면 <strong style={{ color: ink }}>{modeLabel}</strong> 모드로 바로 빌더가
            열립니다. 난이도 · 예상 블록 수 · 목표 시간을 참고하세요.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {CHALLENGES.map((c, i) => (
            <ChallengeCard
              key={c.id}
              c={c}
              i={i}
              dark={dark}
              panel={panel}
              line={line}
              dim={dim}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
