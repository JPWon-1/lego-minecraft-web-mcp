import React from "react";
import type { Block } from "@blockgame/shared";
import { partsList } from "./InstructionPanel.js";
import { downloadLdraw } from "../state/ldraw.js";

const TYPE_KO: Record<string, string> = {
  brick_1x1: "1×1",
  brick_1x2: "1×2",
  brick_2x2: "2×2",
  brick_2x4: "2×4",
  brick_1x8: "1×8",
  voxel_1x1: "복셀",
  slope_1x2: "슬로프 1×2",
  slope_2x2: "슬로프",
  window_1x2: "창문",
  window_2x2: "창문 2×2",
  door_1x3: "도어",
  baseplate_16x16: "베이스",
};
const COLOR_KO: Record<string, string> = {
  "#E4202B": "빨강", "#FF0000": "빨강",
  "#FFCD00": "노랑", "#FFFF00": "노랑",
  "#006CB7": "파랑", "#0066FF": "파랑",
  "#00852B": "초록", "#00FF00": "초록",
  "#F5F4EF": "흰색", "#FFFFFF": "흰색",
  "#14110D": "검정", "#000000": "검정",
  "#9AA0A5": "회색", "#808080": "회색",
  "#FE8A18": "주황", "#FFA500": "주황",
  "#8B4513": "갈색",
  "#FF66B2": "분홍",
  "#800080": "보라",
};

interface Props {
  blocks: Block[];
  designName?: string;
  onShowInstructions: () => void;
  onReset: () => void;
}

export const DesignPanel: React.FC<Props> = ({
  blocks,
  designName = "새 디자인",
  onShowInstructions,
  onReset,
}) => {
  const parts = partsList(blocks);
  const distinctTypes = new Set(blocks.map((b) => b.type)).size;
  const distinctColors = new Set(blocks.map((b) => b.color.toUpperCase())).size;
  const heightRange = blocks.length
    ? [
        Math.min(...blocks.map((b) => b.position[2])),
        Math.max(...blocks.map((b) => b.position[2])),
      ]
    : [0, 0];

  return (
    <div style={{ padding: 18, color: "#f6f4ef" }}>
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10.5,
          letterSpacing: ".22em",
          color: "rgba(246,244,239,.5)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        § DESIGN
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-.02em",
        }}
      >
        {designName}
      </h3>
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          color: "rgba(246,244,239,.6)",
          marginTop: 6,
          letterSpacing: ".03em",
        }}
      >
        {blocks.length} blocks · {distinctTypes} types · {distinctColors} colors
        {blocks.length > 0 && ` · z=${heightRange[0]}..${heightRange[1]}`}
      </div>

      <button
        onClick={onShowInstructions}
        disabled={blocks.length === 0}
        style={{
          marginTop: 18,
          width: "100%",
          padding: "14px 16px",
          background: blocks.length ? "#E4202B" : "rgba(246,244,239,.06)",
          color: blocks.length ? "#fff" : "rgba(246,244,239,.3)",
          border: "none",
          fontFamily: "inherit",
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          cursor: blocks.length ? "pointer" : "default",
          boxShadow: blocks.length
            ? "0 4px 0 #8d1018, inset 0 2px 0 rgba(255,255,255,.18)"
            : "none",
        }}
      >
        📐 조립 설명서 보기
      </button>

      <button
        onClick={() => {
          const safeName = (designName || "design").replace(/[^\w가-힣-]/g, "_");
          const stats = downloadLdraw(blocks, `${safeName}.ldr`);
          if (stats.skipped.length) {
            console.warn("[ldraw] skipped types:", stats.skipped);
          }
        }}
        disabled={blocks.length === 0}
        title="LDraw .ldr 파일 다운로드 — LeoCAD, BrickLink Studio, LDView 등에서 열기"
        style={{
          marginTop: 8,
          width: "100%",
          padding: "10px 14px",
          background: blocks.length ? "rgba(246,244,239,.06)" : "transparent",
          color: blocks.length ? "rgba(246,244,239,.85)" : "rgba(246,244,239,.25)",
          border: "1px solid rgba(246,244,239,.2)",
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".05em",
          cursor: blocks.length ? "pointer" : "default",
          textAlign: "left",
        }}
      >
        💾 LDraw (.ldr) 내보내기
        <span
          style={{
            display: "block",
            fontSize: 10,
            fontWeight: 400,
            color: blocks.length ? "rgba(246,244,239,.5)" : "rgba(246,244,239,.2)",
            letterSpacing: ".02em",
            marginTop: 2,
            textTransform: "none",
          }}
        >
          LeoCAD · BrickLink Studio 호환
        </span>
      </button>

      <button
        onClick={onReset}
        disabled={blocks.length === 0}
        style={{
          marginTop: 8,
          width: "100%",
          padding: "8px 14px",
          background: "transparent",
          color: blocks.length ? "rgba(246,244,239,.7)" : "rgba(246,244,239,.25)",
          border: "1px solid rgba(246,244,239,.18)",
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".1em",
          cursor: blocks.length ? "pointer" : "default",
        }}
      >
        새로 시작 (리셋)
      </button>

      {/* PARTS LIST */}
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10.5,
            letterSpacing: ".22em",
            color: "rgba(246,244,239,.5)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          § PARTS · {parts.length}종
        </div>
        {parts.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              color: "rgba(246,244,239,.4)",
              letterSpacing: ".05em",
              lineHeight: 1.5,
            }}
          >
            ⋮ 블록을 놓거나 채팅에서 짓고 싶은 걸 말해보세요
            <br />
            예: "빨간 지붕 작은 집" / "3층 탑"
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {parts.map((p) => (
              <li
                key={`${p.type}|${p.color}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  background: "#0e0c08",
                  border: "1px solid rgba(246,244,239,.1)",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    background: p.color,
                    border: "1px solid rgba(0,0,0,.35)",
                    boxShadow: "inset 0 -2px 0 rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.18)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#FFCD00",
                    minWidth: 32,
                  }}
                >
                  ×{p.count}
                </span>
                <span style={{ fontSize: 12, color: "rgba(246,244,239,.85)" }}>
                  {TYPE_KO[p.type] ?? p.type}{" "}
                  <span style={{ color: "rgba(246,244,239,.5)" }}>
                    {COLOR_KO[p.color] ?? p.color}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
