import React from "react";
import type { ScoreReport } from "@blockgame/shared";

interface Props { report: ScoreReport; onClose: () => void }

export const ScoreReportModal: React.FC<Props> = ({ report, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    zIndex: 1000,
  }}>
    <div style={{ background: "#222", padding: 24, borderRadius: 8, maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
      <h2>🏆 챌린지 완료 — {report.breakdown.grade} 등급</h2>
      <p style={{ fontSize: 36, margin: 0 }}>{report.breakdown.final} / 100</p>
      <p>시간: {report.total_time_seconds}s · 턴: {report.turn_count}</p>

      <h3>점수 내역</h3>
      <ul>
        <li>Voxel IoU: {report.breakdown.iou_points}</li>
        <li>효율 보너스: +{report.breakdown.efficiency_bonus}</li>
        <li>모호 페널티: -{report.breakdown.ambiguity_penalty}</li>
        <li>힌트 페널티: -{report.breakdown.hint_penalty}</li>
      </ul>

      {[report.good, report.bad, report.unnecessary, report.missing, report.recommendations].map(s => (
        <section key={s.title}>
          <h3>{s.title}</h3>
          <ul>{s.items.length === 0 ? <li><em>(없음)</em></li> : s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
        </section>
      ))}

      {!report.llm_analysis_available && (
        <p style={{ opacity: 0.6 }}><em>(LLM 분석 불가 — 키워드 폴백 사용)</em></p>
      )}
      <button onClick={onClose} style={{
        padding: "10px 20px", background: "#555", color: "#fff", border: "none",
        borderRadius: 6, cursor: "pointer", fontSize: 16, marginTop: 16,
      }}>닫기</button>
    </div>
  </div>
);
