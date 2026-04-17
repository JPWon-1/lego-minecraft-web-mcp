export interface ScoreBreakdown {
  voxel_iou: number;
  iou_points: number;
  efficiency_bonus: number;
  ambiguity_penalty: number;
  hint_penalty: number;
  final: number;
  grade: "S" | "A" | "B" | "C" | "D";
}

export interface ReportSection {
  title: string;
  items: string[];
}

export interface ScoreReport {
  challenge_id: string;
  session_id: string;
  submitted_at: number;
  total_time_seconds: number;
  turn_count: number;
  breakdown: ScoreBreakdown;
  good: ReportSection;
  bad: ReportSection;
  unnecessary: ReportSection;
  missing: ReportSection;
  recommendations: ReportSection;
  llm_analysis_available: boolean;
}
