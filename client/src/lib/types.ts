export type WorkoutType = "recovery" | "endurance" | "tempo" | "threshold" | "vo2max" | "anaerobic";
export type Difficulty = "easy" | "standard" | "hard";

export type Step = {
  minutes: number;
  intensityPct: number;
  description: string;
  phase?: "warmup" | "work" | "recovery" | "cooldown";
};

export type Workout = {
  title: string;
  steps: Step[];
  totalMinutes: number;
  workMinutes?: number;
  recoveryMinutes?: number;
  avgIntensity?: number;
};

export interface WorkoutFormData {
  ftp: number;
  durationMin: number;
  type: WorkoutType;
  difficulty: Difficulty;
}
