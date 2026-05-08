// Landing page for 차곡차곡 — AI block designer with auto-generated assembly
// instructions. Pivoted from the original challenge/score game.

import React from "react";
import { Brick, StudField, LEGO } from "./primitives";
import { PROMPTS } from "./plans";
import { HeroChatBuild } from "./HeroChatBuild";
import { BrickButton } from "./ChallengeCard";

interface Props {
  /** Called when user clicks any "Let's BUILD" CTA. */
  onEnterApp: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

export const Landing: React.FC<Props> = ({ onEnterApp, dark, onToggleDark }) => {
  const [promptIdx, setPromptIdx] = React.useState(0);

  const bg = dark ? "#14110d" : "#f2ece0";
  const ink = dark ? "#f6f4ef" : "#14110d";
  const dim = dark ? "rgba(246,244,239,.6)" : "rgba(20,17,13,.62)";
  const line = dark ? "rgba(246,244,239,.14)" : "rgba(20,17,13,.12)";
  const panel = dark ? "#1d1913" : "#f8f4ea";

  const activePrompt = PROMPTS[promptIdx];
  void activePrompt;

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: bg, color: ink,
      fontFamily: '"Inter Tight","Pretendard",-apple-system,sans-serif',
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: dark ? 0.25 : 0.5 }}>
        <StudField unit={30} color={bg} dot={dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.055)"} />
      </div>

      {/* Nav */}
      <div style={{
        position: "relative", zIndex: 2, display: "flex", alignItems: "center",
        padding: "22px 56px", borderBottom: `1px solid ${line}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ transform: "rotate(-6deg) translateY(1px)" }}>
            <Brick cols={2} rows={1} unit={18} color={LEGO.red} />
          </div>
          <div style={{ fontWeight: 800, letterSpacing: "-.02em", fontSize: 22 }}>
            차곡차곡<span style={{ color: LEGO.red }}>.</span>
          </div>
          <span style={{
            marginLeft: 12, padding: "2px 8px", fontSize: 10, fontWeight: 700,
            letterSpacing: ".15em", background: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)", color: dim,
          }}>BETA</span>
        </div>
        <div style={{ flex: 1 }} />
        <nav style={{ display: "flex", gap: 24, fontSize: 14, fontWeight: 500, alignItems: "center" }}>
          {[
            { label: "사용 흐름", anchor: "how-it-works" },
            { label: "갤러리", anchor: "gallery" },
            { label: "FAQ", anchor: "faq" },
          ].map((t) => (
            <a
              key={t.anchor}
              href={`#${t.anchor}`}
              style={{ color: ink, opacity: 0.72, cursor: "pointer", textDecoration: "none" }}
            >{t.label}</a>
          ))}
          <button
            onClick={onToggleDark}
            title="toggle theme"
            style={{
              border: `1px solid ${line}`, background: "transparent", color: ink,
              padding: "6px 10px", cursor: "pointer", fontSize: 13,
            }}
          >{dark ? "☼" : "☾"}</button>
        </nav>
      </div>

      {/* HERO */}
      <section style={{
        position: "relative", zIndex: 2, padding: "80px 56px 100px",
        display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 64, alignItems: "center",
      }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px",
            background: dark ? "rgba(228,32,43,.14)" : "#ffe8e9", color: LEGO.red,
            fontSize: 12, fontWeight: 700, letterSpacing: ".12em",
            textTransform: "uppercase", marginBottom: 28,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: LEGO.red, animation: "bm-pulse 1.6s infinite" }} />
            말로 짓는 LEGO 디자이너
          </div>
          <h1 style={{
            fontSize: "clamp(56px, 7vw, 108px)", lineHeight: 0.92, letterSpacing: "-.03em",
            fontWeight: 800, margin: 0, textWrap: "balance" as unknown as undefined,
          }}>
            말하면<br />
            <span style={{
              display: "inline-block", padding: "0 .12em",
              background: LEGO.red, color: "#fff",
              boxShadow: "inset 0 -10px 0 rgba(0,0,0,.18), inset 0 6px 0 rgba(255,255,255,.15)",
            }}>차곡차곡.</span>
          </h1>
          <p style={{ fontSize: 19, maxWidth: 540, marginTop: 28, lineHeight: 1.6, color: dim }}>
            짓고 싶은 걸 한 마디 들려주세요.
            AI가 블록으로 그려보고, <strong style={{ color: ink }}>조립 설명서</strong>까지 한 장씩 만들어드려요.
            <br />
            진짜 LEGO로 그대로 따라 지어도 좋아요.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 40, flexWrap: "wrap" }}>
            <BrickButton label="짓기 시작  →" onClick={() => onEnterApp()} />
          </div>
        </div>

        <HeroChatBuild
          dark={dark}
          promptIdx={promptIdx}
          onCycle={() => setPromptIdx((c) => (c + 1) % PROMPTS.length)}
        />
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{
        position: "relative", zIndex: 2, padding: "96px 56px",
        borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, background: panel,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 40 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: dim, letterSpacing: ".2em" }}>§ 01</div>
          <h2 style={{ fontSize: 44, letterSpacing: "-.02em", margin: 0, fontWeight: 800 }}>이렇게 차곡차곡</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { n: "01", t: "말한다", d: "\"빨간 지붕 작은 집\" 같은 한 마디. 직접 클릭해서 짓는 것도 OK.",
              visual: (
                <code style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 13, padding: "6px 10px",
                  background: dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color: ink,
                }}>“2층 별장 지어줘”</code>
              ) },
            { n: "02", t: "쌓인다", d: "AI가 한 칸씩 차곡차곡 블록을 놓아드려요.",
              visual: (
                <div style={{ display: "flex", gap: 4 }}>
                  {[LEGO.red, LEGO.white, LEGO.yellow, LEGO.blue, LEGO.green].map((c, i) => (
                    <div key={i} style={{
                      width: 14, height: 14, background: c,
                      boxShadow: "inset 0 -2px 0 rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.18)",
                    }}/>
                  ))}
                </div>
              ) },
            { n: "03", t: "설명서로 받는다", d: "한 장씩 넘기는 조립 설명서가 자동으로 나와요. 진짜 LEGO 부품으로 그대로 따라 지어도 좋아요.",
              visual: (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 10px",
                  background: LEGO.yellow, color: "#14110d", fontSize: 11, fontWeight: 800, letterSpacing: ".15em",
                }}>
                  <span>📐</span><span>STEP 1 / 50</span>
                </div>
              ) },
          ].map((s) => (
            <div key={s.n} style={{ padding: 28, background: bg, border: `1px solid ${line}`, position: "relative" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: LEGO.red, letterSpacing: ".18em" }}>{s.n}</div>
              <div style={{ fontSize: 24, fontWeight: 700, margin: "10px 0 8px", letterSpacing: "-.01em" }}>{s.t}</div>
              <p style={{ color: dim, fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>{s.d}</p>
              <div>{s.visual}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY — example prompts that build interesting things */}
      <section id="gallery" style={{ position: "relative", zIndex: 2, padding: "96px 56px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: dim, letterSpacing: ".2em" }}>§ 03</div>
          <h2 style={{ fontSize: 44, letterSpacing: "-.02em", margin: 0, fontWeight: 800 }}>이런 거 짓고 싶어요</h2>
          <span style={{ color: dim, fontSize: 16 }}>한 마디 입력 예시</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { tag: "집", emoji: "🏠", prompt: "빨간 지붕 작은 오두막", note: "처음 시작하기 좋아요" },
            { tag: "탑", emoji: "🗼", prompt: "10층 회색 돌탑, 꼭대기에 빨간 깃발", note: "높이 쌓기" },
            { tag: "탈것", emoji: "✈️", prompt: "노란 비행기, 양쪽 날개 6칸", note: "양쪽이 똑같이" },
            { tag: "성", emoji: "🏰", prompt: "코너에 타워 4개, 가운데 박공 지붕", note: "본격 큰 작품" },
            { tag: "정원", emoji: "🌷", prompt: "잔디밭에 튤립 5송이 + 나무", note: "꾸미기 좋아요" },
            { tag: "그림", emoji: "🎨", prompt: "픽셀 아트 무지개 다리", note: "색깔 놀이" },
          ].map((g) => (
            <div
              key={g.tag}
              onClick={() => onEnterApp()}
              style={{
                padding: "20px 22px", background: panel, border: `1px solid ${line}`,
                cursor: "pointer", display: "flex", flexDirection: "column", gap: 10,
                transition: "transform .18s, box-shadow .18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>{g.emoji}</span>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 800,
                  letterSpacing: ".2em", color: LEGO.red,
                }}>
                  {g.tag.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.3 }}>
                "{g.prompt}"
              </div>
              <div style={{ color: dim, fontSize: 12.5, fontFamily: '"JetBrains Mono", monospace', letterSpacing: ".03em" }}>
                {g.note}
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: dim, fontSize: 14, marginTop: 28, textAlign: "center" }}>
          ▸ 정해진 답이 없어요. 자유롭게 짓는 도구입니다.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" style={{
        position: "relative", zIndex: 2, padding: "96px 56px", background: panel,
        borderTop: `1px solid ${line}`,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 36 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: dim, letterSpacing: ".2em" }}>§ 03</div>
          <h2 style={{ fontSize: 44, letterSpacing: "-.02em", margin: 0, fontWeight: 800 }}>자주 묻는 것</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px 28px" }}>
          {([
            ["진짜 LEGO 부품으로 따라 지을 수 있어요?",
              "네. 조립 설명서에 어떤 부품을 몇 개 어떤 색으로 쓰는지 다 나와요. 그대로 사서 만드시면 됩니다."],
            ["AI 없이 직접 디자인해도 되나요?",
              "물론이에요. 창문·문·지붕 같은 미리 만든 조각으로 클릭해서 자유롭게 짓기. AI는 그냥 도와주는 친구."],
            ["LEGO랑 Minecraft 차이가 뭐예요?",
              "LEGO는 진짜 브릭처럼 모양과 크기가 다양해요. Minecraft는 작은 큐브 하나로 자유롭게 픽셀 아트처럼 짓기."],
            ["어디서 시작해요?",
              "위 \"짓기 시작\" 버튼 → 둘 중 하나 고르기 → 빈 베이스플레이트에서 마음껏."],
          ] as const).map(([q, a]) => (
            <details key={q} style={{ padding: "18px 0", borderBottom: `1px solid ${line}`, cursor: "pointer" }}>
              <summary style={{
                fontWeight: 700, fontSize: 17, listStyle: "none",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <Brick cols={1} rows={1} unit={14} color={LEGO.red} />{q}
              </summary>
              <p style={{ color: dim, fontSize: 15, lineHeight: 1.6, margin: "10px 0 0 26px" }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ position: "relative", zIndex: 2, padding: "100px 56px 120px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", gap: 6, marginBottom: 24 }}>
          {[LEGO.red, LEGO.yellow, LEGO.blue, LEGO.green].map((c, i) => (
            <div key={i} style={{ animation: `bm-bob 2.4s ${i * 0.2}s ease-in-out infinite` }}>
              <Brick cols={2} rows={1} unit={26} color={c} />
            </div>
          ))}
        </div>
        <h2 style={{
          fontSize: "clamp(48px, 7vw, 96px)", letterSpacing: "-.03em",
          margin: 0, fontWeight: 800, lineHeight: 0.95,
        }}>자, 뭘 지어볼까요?</h2>
        <p style={{ color: dim, fontSize: 18, marginTop: 18, marginBottom: 36 }}>
          한 마디만 던져보세요. AI가 차곡차곡 쌓아드릴게요.
        </p>
        <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <BrickButton label="짓기 시작" big onClick={() => onEnterApp()} />
        </div>
      </section>

      <footer style={{
        position: "relative", zIndex: 2, padding: "32px 56px",
        borderTop: `1px solid ${line}`, fontSize: 13, color: dim,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Brick cols={2} rows={1} unit={14} color={LEGO.red} />
          <span>차곡차곡 · MIT licensed · made in KR</span>
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace' }}>v0.0.1</div>
      </footer>

      <style>{`
        @keyframes bm-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes bm-marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes bm-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes bm-drop { 0%{transform:translateY(-40px);opacity:0} 60%{transform:translateY(4px);opacity:1} 80%{transform:translateY(-2px)} 100%{transform:translateY(0)} }
      `}</style>
    </div>
  );
};

