// Hero chat → build animation, extracted from the HTML design.
// Pure React 18, inline styles (matches the rest of web-app).

import React from "react";
import { Brick, StudField, LEGO } from "./primitives";
import { PROMPTS, PLANS, GRID_COLS, PromptSpec } from "./plans";

type Step = 0 | 1 | 2 | 3; // 0 typing, 1 sent, 2 building, 3 done

const COLOR_NAME: Record<string, string> = {
  [LEGO.red]: "red",
  [LEGO.blue]: "blue",
  [LEGO.yellow]: "yellow",
  [LEGO.green]: "green",
  [LEGO.white]: "white",
  [LEGO.black]: "black",
  [LEGO.grey]: "grey",
  [LEGO.orange]: "orange",
};
const LOG_WINDOW = 4;

interface Props {
  dark: boolean;
  promptIdx: number;
  onCycle: () => void;
}

export const HeroChatBuild: React.FC<Props> = ({ dark, promptIdx, onCycle }) => {
  const [step, setStep] = React.useState<Step>(0);
  const [typed, setTyped] = React.useState("");
  const [visibleBricks, setVisibleBricks] = React.useState(0);
  const p: PromptSpec = PROMPTS[promptIdx];
  const plan = PLANS[p.model];

  const placeOrder = React.useMemo(() => {
    const order: { r: number; c: number; color: string }[] = [];
    for (let r = plan.length - 1; r >= 0; r--) {
      for (let c = 0; c < GRID_COLS; c++) {
        const v = plan[r][c];
        if (v) order.push({ r, c, color: v });
      }
    }
    return order;
  }, [plan]);
  const totalBricks = placeOrder.length;

  React.useEffect(() => {
    setTyped(""); setStep(0); setVisibleBricks(0);
    let i = 0;
    const timers: number[] = [];
    const typeNext = () => {
      i++;
      setTyped(p.ko.slice(0, i));
      if (i < p.ko.length) {
        timers.push(window.setTimeout(typeNext, 52 + Math.random() * 45));
      } else {
        timers.push(window.setTimeout(() => setStep(1), 380));
        timers.push(window.setTimeout(() => setStep(2), 820));
        const per = Math.max(22, Math.min(55, Math.floor(2800 / totalBricks)));
        for (let k = 0; k <= totalBricks; k++) {
          timers.push(window.setTimeout(() => setVisibleBricks(k), 820 + k * per));
        }
        timers.push(window.setTimeout(() => setStep(3), 820 + totalBricks * per + 220));
        timers.push(window.setTimeout(onCycle, 820 + totalBricks * per + 2600));
      }
    };
    timers.push(window.setTimeout(typeNext, 320));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptIdx]);

  const panel = dark ? "#1d1913" : "#f8f4ea";
  const line = dark ? "rgba(246,244,239,.14)" : "rgba(20,17,13,.1)";
  const ink = dark ? "#f6f4ef" : "#14110d";
  const subtle = dark ? "rgba(246,244,239,.6)" : "rgba(20,17,13,.55)";

  const orderByCell = React.useMemo(() => {
    const m = new Map<number, number>();
    placeOrder.forEach((o, idx) => m.set(o.r * GRID_COLS + o.c, idx));
    return m;
  }, [placeOrder]);

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < plan.length; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const color = plan[r][c];
      const key = r * GRID_COLS + c;
      if (!color) { cells.push(<div key={key} />); continue; }
      const idx = orderByCell.get(key)!;
      const show = step >= 3 ? true : step >= 2 && idx < visibleBricks;
      cells.push(
        <div
          key={key}
          style={{
            width: 18, height: 18,
            animation: show ? "bm-drop .22s cubic-bezier(.2,.7,.3,1.2) both" : "none",
            opacity: show ? 1 : 0,
          }}
        >
          {show && <Brick cols={1} rows={1} unit={18} color={color} />}
        </div>,
      );
    }
  }

  return (
    <div style={{
      position: "relative", aspectRatio: "4/5", background: panel,
      border: `1px solid ${line}`, display: "flex", flexDirection: "column",
      boxShadow: "0 10px 40px rgba(0,0,0,.08)",
    }}>
      {/* chat bar */}
      <div style={{ padding: 14, borderBottom: `1px solid ${line}`, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#25c25a", animation: "bm-pulse 1.6s infinite" }} />
        <div style={{ fontSize: 11, color: subtle, fontFamily: '"JetBrains Mono", monospace' }}>
          AI가 차곡차곡 짓는 중
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10, color: subtle, fontFamily: '"JetBrains Mono", monospace' }}>
          {promptIdx + 1}/{PROMPTS.length}
        </div>
      </div>

      <div style={{ padding: "16px 16px 8px" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 11, background: "#c96442",
            color: "#fff", fontSize: 12, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700, flexShrink: 0,
          }}>u</div>
          <div style={{
            padding: "9px 13px", background: dark ? "#2a251f" : "#fff",
            border: `1px solid ${line}`, fontSize: 14.5, lineHeight: 1.4,
            maxWidth: "85%", color: ink,
          }}>
            {typed}
            <span style={{ opacity: step === 0 ? 1 : 0, color: LEGO.red }}>│</span>
          </div>
        </div>
        {step >= 1 && (
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 11, background: LEGO.red,
              color: "#fff", fontSize: 11, fontWeight: 800, display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>C</div>
            <div style={{
              flex: 1, minWidth: 0,
              padding: "9px 13px", background: dark ? "#0e0c08" : "#14110d",
              border: `1px solid ${line}`, fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11, color: "#f6f4ef", lineHeight: 1.55,
              overflow: "hidden",
            }}>
              <div>
                <span style={{ color: "rgba(246,244,239,.55)" }}>알겠어요, </span>
                <span style={{ color: LEGO.yellow }}>{totalBricks}</span>
                <span style={{ color: "rgba(246,244,239,.55)" }}>개 블록으로 짓기 시작…</span>
              </div>
              {step >= 2 && (() => {
                const start = Math.max(0, visibleBricks - LOG_WINDOW);
                const end = Math.min(placeOrder.length, visibleBricks);
                const rows: React.ReactNode[] = [];
                for (let i = start; i < end; i++) {
                  const b = placeOrder[i];
                  const name = COLOR_NAME[b.color] ?? "블록";
                  rows.push(
                    <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ color: "rgba(246,244,239,.45)" }}>·</span>{" "}
                      <span style={{ color: LEGO.yellow }}>{name}</span>
                      <span style={{ color: "rgba(246,244,239,.65)" }}>
                        {" 블록 한 개 놓는 중"}
                      </span>
                    </div>,
                  );
                }
                return rows;
              })()}
              {step >= 2 && visibleBricks < totalBricks && (
                <div style={{ color: "rgba(246,244,239,.4)" }}>
                  ⋮ {visibleBricks} / {totalBricks} 차곡차곡…
                </div>
              )}
              {step >= 3 && (
                <div>
                  <span style={{ color: LEGO.green }}>✓ 완성!</span>
                  <span style={{ color: "rgba(246,244,239,.55)" }}>
                    {` 총 ${totalBricks}개 블록`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* build canvas */}
      <div style={{
        flex: 1, position: "relative", borderTop: `1px solid ${line}`,
        background: dark ? "#0e0c08" : "#eae3d2", overflow: "hidden",
      }}>
        <StudField unit={22} color={dark ? "#0e0c08" : "#e9e1cc"} dot={dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.15)"} />
        <div style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
          display: "grid", gridTemplateColumns: `repeat(${GRID_COLS}, 18px)`, gridAutoRows: "18px", gap: 1,
        }}>
          {cells}
        </div>
        {step === 3 && (
          <div style={{
            position: "absolute", bottom: 14, left: 14, padding: "6px 10px",
            background: LEGO.green, color: "#fff", fontSize: 11, fontWeight: 800,
            letterSpacing: ".12em", animation: "bm-drop .3s both",
          }}>
            ✓ 완성 · {totalBricks}개 블록
          </div>
        )}
        <div style={{
          position: "absolute", top: 12, right: 14,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
          color: dark ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.45)", letterSpacing: ".1em",
        }}>다음 예시 보기 →</div>
        <div onClick={onCycle} style={{ position: "absolute", inset: 0, cursor: "pointer" }} />
      </div>
    </div>
  );
};
