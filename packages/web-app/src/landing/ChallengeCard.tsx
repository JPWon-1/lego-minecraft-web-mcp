// Challenge gallery card, ported from variant-baseplate-v2.jsx

import React from "react";
import { Brick, shade } from "./primitives";
import { ChallengeMeta, DIFF_COLOR, CARD_PALETTES } from "./data";

interface Props {
  c: ChallengeMeta;
  i: number;
  dark: boolean;
  panel: string;
  line: string;
  dim: string;
  onSelect?: (id: string) => void;
}

export const ChallengeCard: React.FC<Props> = ({ c, i, dark, panel, line, dim, onSelect }) => {
  const d = DIFF_COLOR[c.difficulty];
  const [hover, setHover] = React.useState(false);
  const pal = CARD_PALETTES[i % CARD_PALETTES.length];
  return (
    <div
      onClick={() => onSelect?.(c.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: panel, border: `1px solid ${line}`, overflow: "hidden",
        cursor: "pointer", transition: "transform .18s, box-shadow .18s",
        transform: hover ? "translateY(-3px)" : "none",
        boxShadow: hover ? "0 12px 32px rgba(0,0,0,.12)" : "none",
      }}
    >
      <div style={{
        height: 180, position: "relative",
        backgroundImage: `linear-gradient(135deg, ${shade(d.bg, -34)}, ${shade(d.bg, 14)})`,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 3,
          transform: hover ? "translateY(-3px)" : "none", transition: "transform .25s",
        }}>
          <Brick cols={Math.max(2, ((c.blocks + i) % 3) + 2)} rows={1} unit={22} color={pal[0]} />
          <Brick cols={Math.max(3, ((c.blocks + i) % 4) + 3)} rows={1} unit={22} color={pal[1]} />
          <Brick cols={Math.max(2, ((c.blocks + i) % 5) + 2)} rows={1} unit={22} color={pal[2]} />
        </div>
        <span style={{
          position: "absolute", top: 12, left: 12, padding: "4px 10px",
          background: d.bg, color: d.fg, fontSize: 10, letterSpacing: ".15em", fontWeight: 800,
        }}>{d.label}</span>
        <span style={{
          position: "absolute", top: 12, right: 12,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: "rgba(255,255,255,.85)",
        }}>{c.id}</span>
        {hover && (
          <span style={{
            position: "absolute", bottom: 12, right: 12, padding: "4px 8px",
            background: "rgba(0,0,0,.7)", color: "#fff", fontSize: 10,
            fontFamily: '"JetBrains Mono", monospace', letterSpacing: ".15em",
          }}>BUILD →</span>
        )}
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.01em" }}>{c.title}</div>
        <div style={{ fontSize: 13, color: dim, marginTop: 2 }}>{c.en}</div>
        <div style={{
          display: "flex", gap: 14, marginTop: 14, fontSize: 12, color: dim,
          fontFamily: '"JetBrains Mono", monospace',
        }}>
          <span>{c.grid}</span><span>·</span><span>~{c.blocks}</span><span>·</span><span>{c.time}</span>
        </div>
      </div>
    </div>
  );
};

interface BrickButtonProps {
  label: string;
  big?: boolean;
  onClick?: () => void;
}

export const BrickButton: React.FC<BrickButtonProps> = ({ label, big, onClick }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: big ? "22px 36px" : "18px 28px",
        fontSize: big ? 18 : 17, fontWeight: 800, letterSpacing: ".02em",
        background: "#E4202B", color: "#fff", border: "none", cursor: "pointer",
        boxShadow: hover
          ? "0 3px 0 #8d1018, inset 0 2px 0 rgba(255,255,255,.2)"
          : "0 6px 0 #8d1018, inset 0 2px 0 rgba(255,255,255,.2)",
        transform: hover ? "translateY(3px)" : "none",
        transition: "all .08s ease",
        fontFamily: "inherit", textTransform: "uppercase",
      }}
    >
      {label}
    </button>
  );
};
