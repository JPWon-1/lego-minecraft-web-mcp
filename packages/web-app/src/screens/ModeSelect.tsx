import React from "react";
import type { Track } from "@blockgame/shared";
import { Brick, StudField, LEGO } from "../landing/primitives.js";

interface Props {
  dark: boolean;
  onBack: () => void;
  onSelect: (track: Track) => void;
}

export const ModeSelect: React.FC<Props> = ({ dark, onBack, onSelect }) => {
  const bg = dark ? "#14110d" : "#f2ece0";
  const ink = dark ? "#f6f4ef" : "#14110d";
  const dim = dark ? "rgba(246,244,239,.6)" : "rgba(20,17,13,.62)";
  const line = dark ? "rgba(246,244,239,.14)" : "rgba(20,17,13,.12)";
  const panel = dark ? "#1d1913" : "#f8f4ea";

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
        display: "flex",
        flexDirection: "column",
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
          <span style={{ opacity: 0.5 }}>←</span> landing
        </button>
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
          Pick your medium
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "56px 56px 80px",
          gap: 40,
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
            § PICK YOUR MEDIUM
          </div>
          <h1
            style={{
              fontSize: "clamp(44px, 5vw, 72px)",
              letterSpacing: "-.02em",
              lineHeight: 0.95,
              fontWeight: 800,
              margin: 0,
            }}
          >
            같은 프롬프트,
            <br />
            다른 재료.
          </h1>
          <p style={{ color: dim, fontSize: 17, marginTop: 18, maxWidth: 620, lineHeight: 1.5 }}>
            두 렌더러는 같은 MCP 서버에 붙지만 쌓이는 결이 달라요. 원하는 쪽을 고르세요.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            flex: 1,
            alignItems: "stretch",
          }}
        >
          <ModeCard
            title="LEGO"
            ko="레고"
            sub="Bricks · 9 colors · slopes · windows · doors"
            accent={LEGO.red}
            bullets={[
              "1×1·1×2·2×2·2×4·1×8 브릭",
              "슬로프 · 창문 · 도어",
              "스터드 격자 스냅",
              "레고 클래식 9 컬러",
            ]}
            imgPath="/landing/lego-plane.png"
            dark={dark}
            panel={panel}
            line={line}
            dim={dim}
            ink={ink}
            onSelect={() => onSelect("lego")}
          />
          <ModeCard
            title="Minecraft"
            ko="마인크래프트"
            sub="Voxels · palette · flight · click to place"
            accent={LEGO.green}
            bullets={[
              "1×1 복셀",
              "10 색 팔레트",
              "비행 / 지면 / 고스트 모드",
              "좌클릭 배치 · 우클릭 제거",
            ]}
            imgPath="/landing/game.png"
            dark={dark}
            panel={panel}
            line={line}
            dim={dim}
            ink={ink}
            onSelect={() => onSelect("minecraft")}
          />
        </div>

        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: dim,
            letterSpacing: ".1em",
          }}
        >
          ▸ 선택 후 빈 베이스플레이트에서 자유 디자인 시작
        </div>
      </div>
    </div>
  );
};

interface ModeCardProps {
  title: string;
  ko: string;
  sub: string;
  accent: string;
  bullets: string[];
  imgPath: string;
  dark: boolean;
  panel: string;
  line: string;
  dim: string;
  ink: string;
  onSelect: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({
  title,
  ko,
  sub,
  accent,
  bullets,
  imgPath,
  dark,
  panel,
  line,
  dim,
  ink,
  onSelect,
}) => {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left",
        background: panel,
        border: `1px solid ${hover ? accent : line}`,
        padding: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        color: ink,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "border-color .2s, transform .2s, box-shadow .2s",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? `0 16px 44px rgba(0,0,0,${dark ? ".5" : ".14"})` : "none",
      }}
    >
      <div
        style={{
          aspectRatio: "16/9",
          background: "#000",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={imgPath}
          alt={`${title} screenshot`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform .6s",
            transform: hover ? "scale(1.04)" : "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            padding: "4px 10px",
            background: accent,
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: ".18em",
          }}
        >
          MODE · {title.toUpperCase()}
        </span>
      </div>

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: "-.02em",
              lineHeight: 1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 14,
              color: dim,
              marginTop: 6,
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {ko} · {sub}
          </div>
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {bullets.map((b) => (
            <li key={b} style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <span style={{ color: accent, fontWeight: 800 }}>▪</span>
              {b}
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${line}`,
            paddingTop: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Brick cols={2} rows={1} unit={14} color={accent} />
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                color: dim,
                letterSpacing: ".15em",
              }}
            >
              READY
            </span>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: hover ? accent : ink,
              transition: "color .2s",
            }}
          >
            Select {hover ? "→" : "›"}
          </span>
        </div>
      </div>
    </button>
  );
};
