export type WorkoutType = "recovery" | "endurance" | "tempo" | "threshold" | "vo2max" | "anaerobic";
export type Difficulty = "easy" | "standard" | "hard";

export type Step = {
  minutes: number;
  intensityPct: number;
  description: string;
};

export type Workout = {
  title: string;
  steps: Step[];
  totalMinutes: number;
};