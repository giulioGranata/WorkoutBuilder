export type PatternBlock = {
  minutes: number;
  intensityPct: number;
  description: string;
  phase: "work" | "recovery";
};

export type PatternSet = Record<
  | "recovery"
  | "endurance"
  | "tempo"
  | "threshold"
  | "vo2max"
  | "anaerobic",
  PatternBlock[][]
>;

export const PATTERNS: PatternSet = {
  // Recovery: 50-60% FTP
  recovery: [
    // A (existing pattern reused)
    [{ minutes: 20, intensityPct: 55, description: "Easy recovery ride", phase: "work" }],
    // B
    [
      { minutes: 10, intensityPct: 55, description: "Easy spin", phase: "work" },
      { minutes: 10, intensityPct: 60, description: "High-cadence easy", phase: "work" },
    ],
    // C
    [
      { minutes: 5, intensityPct: 55, description: "Easy spin", phase: "work" },
      { minutes: 5, intensityPct: 60, description: "Smooth cadence", phase: "work" },
      { minutes: 5, intensityPct: 55, description: "Easy spin", phase: "work" },
      { minutes: 5, intensityPct: 60, description: "Smooth cadence", phase: "work" },
    ],
  ],

  // Endurance: 65-75% FTP
  endurance: [
    // A (existing pattern reused)
    [{ minutes: 45, intensityPct: 65, description: "Steady endurance effort", phase: "work" }],
    // B
    [
      { minutes: 20, intensityPct: 70, description: "Endurance steady 1", phase: "work" },
      { minutes: 5, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 20, intensityPct: 70, description: "Endurance steady 2", phase: "work" },
    ],
    // C
    [
      { minutes: 15, intensityPct: 72, description: "Endurance sustained 1", phase: "work" },
      { minutes: 5, intensityPct: 60, description: "Reset", phase: "recovery" },
      { minutes: 15, intensityPct: 70, description: "Endurance sustained 2", phase: "work" },
    ],
  ],

  // Tempo: 76-90% FTP
  tempo: [
    // A (existing pattern reused)
    [
      { minutes: 15, intensityPct: 85, description: "Tempo block 1", phase: "work" },
      { minutes: 5, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 15, intensityPct: 85, description: "Tempo block 2", phase: "work" },
    ],
    // B
    [
      { minutes: 10, intensityPct: 88, description: "Tempo effort 1", phase: "work" },
      { minutes: 4, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 10, intensityPct: 88, description: "Tempo effort 2", phase: "work" },
      { minutes: 4, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 10, intensityPct: 88, description: "Tempo effort 3", phase: "work" },
    ],
    // C
    [
      { minutes: 20, intensityPct: 80, description: "Tempo sustained 1", phase: "work" },
      { minutes: 5, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 20, intensityPct: 80, description: "Tempo sustained 2", phase: "work" },
    ],
  ],

  // Threshold: 95-105% FTP
  threshold: [
    // A (existing pattern reused)
    [
      { minutes: 10, intensityPct: 100, description: "Threshold block 1", phase: "work" },
      { minutes: 5, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 10, intensityPct: 100, description: "Threshold block 2", phase: "work" },
      { minutes: 5, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 10, intensityPct: 100, description: "Threshold block 3", phase: "work" },
    ],
    // B
    [
      { minutes: 15, intensityPct: 95, description: "Threshold sustained 1", phase: "work" },
      { minutes: 5, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 15, intensityPct: 95, description: "Threshold sustained 2", phase: "work" },
    ],
    // C
    [
      { minutes: 8, intensityPct: 100, description: "Threshold repeats 1", phase: "work" },
      { minutes: 4, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 8, intensityPct: 100, description: "Threshold repeats 2", phase: "work" },
      { minutes: 4, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 8, intensityPct: 100, description: "Threshold repeats 3", phase: "work" },
      { minutes: 4, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 8, intensityPct: 100, description: "Threshold repeats 4", phase: "work" },
    ],
  ],

  // VO2max: 110-120% FTP
  vo2max: [
    // A (existing pattern reused)
    [
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
    // B
    [
      { minutes: 3, intensityPct: 118, description: "VO2 repeats 1", phase: "work" },
      { minutes: 3, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 3, intensityPct: 118, description: "VO2 repeats 2", phase: "work" },
      { minutes: 3, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 3, intensityPct: 118, description: "VO2 repeats 3", phase: "work" },
      { minutes: 3, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 3, intensityPct: 118, description: "VO2 repeats 4", phase: "work" },
      { minutes: 3, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 3, intensityPct: 118, description: "VO2 repeats 5", phase: "work" },
      { minutes: 3, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 3, intensityPct: 118, description: "VO2 repeats 6", phase: "work" },
    ],
    // C
    [
      { minutes: 2, intensityPct: 120, description: "VO2 short 1", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 2, intensityPct: 120, description: "VO2 short 2", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 2, intensityPct: 120, description: "VO2 short 3", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 2, intensityPct: 120, description: "VO2 short 4", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 2, intensityPct: 120, description: "VO2 short 5", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
    ],
  ],

  // Anaerobic: 125-150% FTP
  anaerobic: [
    // A (existing pattern reused, but minutes rounded up to 1 as per instructions)
    [
      { minutes: 1, intensityPct: 150, description: "Sprint 1", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 2", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 3", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 4", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 5", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 6", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 7", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 8", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 9", phase: "work" },
      { minutes: 1, intensityPct: 55, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 150, description: "Sprint 10", phase: "work" },
    ],
    // B
    [
      { minutes: 1, intensityPct: 140, description: "Anaerobic burst 1", phase: "work" },
      { minutes: 1, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 140, description: "Anaerobic burst 2", phase: "work" },
      { minutes: 1, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 140, description: "Anaerobic burst 3", phase: "work" },
      { minutes: 1, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 140, description: "Anaerobic burst 4", phase: "work" },
      { minutes: 1, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 140, description: "Anaerobic burst 5", phase: "work" },
      { minutes: 1, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 140, description: "Anaerobic burst 6", phase: "work" },
      { minutes: 1, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 140, description: "Anaerobic burst 7", phase: "work" },
      { minutes: 1, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 140, description: "Anaerobic burst 8", phase: "work" },
    ],
    // C
    [
      { minutes: 1, intensityPct: 145, description: "Anaerobic power 1", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 145, description: "Anaerobic power 2", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 145, description: "Anaerobic power 3", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 145, description: "Anaerobic power 4", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 145, description: "Anaerobic power 5", phase: "work" },
      { minutes: 2, intensityPct: 60, description: "Recovery", phase: "recovery" },
      { minutes: 1, intensityPct: 145, description: "Anaerobic power 6", phase: "work" },
    ],
  ],
};
