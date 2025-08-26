export interface PatternBlock {
  minutes: number;
  intensityPct: number;
  description: string;
  phase: "work" | "recovery";
}

export const PATTERNS: Record<
  | "recovery"
  | "endurance"
  | "tempo"
  | "threshold"
  | "vo2max"
  | "anaerobic",
  PatternBlock[]
> = {
  recovery: [
    { minutes: 20, intensityPct: 55, description: "Easy recovery ride", phase: "work" },
  ],
  endurance: [
    { minutes: 45, intensityPct: 65, description: "Steady endurance effort", phase: "work" },
  ],
  tempo: [
    { minutes: 15, intensityPct: 85, description: "Tempo block 1", phase: "work" },
    { minutes: 5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 15, intensityPct: 85, description: "Tempo block 2", phase: "work" },
  ],
  threshold: [
    { minutes: 10, intensityPct: 100, description: "Threshold block 1", phase: "work" },
    { minutes: 5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 10, intensityPct: 100, description: "Threshold block 2", phase: "work" },
    { minutes: 5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 10, intensityPct: 100, description: "Threshold block 3", phase: "work" },
  ],
  vo2max: [
    { minutes: 4, intensityPct: 115, description: "VO2 interval 1", phase: "work" },
    { minutes: 4, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 4, intensityPct: 115, description: "VO2 interval 2", phase: "work" },
    { minutes: 4, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 4, intensityPct: 115, description: "VO2 interval 3", phase: "work" },
    { minutes: 4, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 4, intensityPct: 115, description: "VO2 interval 4", phase: "work" },
    { minutes: 4, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 4, intensityPct: 115, description: "VO2 interval 5", phase: "work" },
  ],
  anaerobic: [
    { minutes: 0.5, intensityPct: 150, description: "Sprint 1", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 2", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 3", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 4", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 5", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 6", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 7", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 8", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 9", phase: "work" },
    { minutes: 0.5, intensityPct: 55, description: "Recovery", phase: "recovery" },
    { minutes: 0.5, intensityPct: 150, description: "Sprint 10", phase: "work" },
  ],
};

