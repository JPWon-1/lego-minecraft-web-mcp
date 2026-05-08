// Tiny CSS LEGO primitives used by the landing page.
// Zero external dependencies.

import React from "react";

export const LEGO = {
  red: "#E4202B",
  blue: "#006CB7",
  yellow: "#FFCD00",
  green: "#00852B",
  white: "#f6f4ef",
  black: "#14110d",
  grey: "#9aa0a5",
  orange: "#FE8A18",
} as const;

export function shade(hex: string, pct: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  r = Math.max(0, Math.min(255, r + Math.round((255 * pct) / 100)));
  g = Math.max(0, Math.min(255, g + Math.round((255 * pct) / 100)));
  b = Math.max(0, Math.min(255, b + Math.round((255 * pct) / 100)));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

interface StudProps {
  size?: number;
  color?: string;
  label?: string;
}

export function Stud({ size = 28, color = LEGO.red, label }: StudProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        position: "relative",
        boxShadow:
          "inset 0 -3px 0 rgba(0,0,0,.22), inset 0 2px 0 rgba(255,255,255,.2)",
        display: "inline-block",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 30%, ${shade(color, 22)}, ${color} 60%, ${shade(color, -18)})`,
          boxShadow: "0 1px 0 rgba(0,0,0,.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: size * 0.18,
          fontWeight: 700,
          color: "rgba(0,0,0,.35)",
          letterSpacing: ".03em",
        }}
      >
        {label ?? "LEGO"}
      </div>
    </div>
  );
}

interface BrickProps {
  cols?: number;
  rows?: number;
  unit?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function Brick({
  cols = 2,
  rows = 1,
  unit = 28,
  color = LEGO.red,
  style,
}: BrickProps) {
  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${cols},${unit}px)`,
        gridTemplateRows: `repeat(${rows},${unit}px)`,
        background: color,
        boxShadow:
          "inset 0 -4px 0 rgba(0,0,0,.22), inset 0 2px 0 rgba(255,255,255,.18), 0 2px 0 rgba(0,0,0,.25)",
        ...style,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: unit * 0.55,
              height: unit * 0.55,
              borderRadius: "50%",
              background: `radial-gradient(circle at 38% 30%, ${shade(color, 22)}, ${color} 60%, ${shade(color, -18)})`,
              boxShadow: "0 1px 0 rgba(0,0,0,.28)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface StudFieldProps {
  unit?: number;
  color?: string;
  dot?: string;
  style?: React.CSSProperties;
}

export function StudField({
  unit = 26,
  color = "#d8d3cb",
  dot = "rgba(0,0,0,.12)",
  style,
}: StudFieldProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: color,
        backgroundImage: `radial-gradient(${dot} 2.2px, transparent 2.6px)`,
        backgroundSize: `${unit}px ${unit}px`,
        backgroundPosition: `${unit / 2}px ${unit / 2}px`,
        ...style,
      }}
    />
  );
}
