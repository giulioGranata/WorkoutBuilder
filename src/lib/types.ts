export type WorkoutType =
  | "recovery"
  | "endurance"
  | "tempo"
  | "threshold"
  | "vo2max"
  | "anaerobic";

export const WORKOUT_TYPES = {
  recovery: {
    label: "Recovery (50-60% FTP)",
    minFtp: 50,
    maxFtp: 60,
    description: "Easy-paced riding to promote active recovery and blood flow",
    value: "recovery",
  },
  endurance: {
    label: "Endurance (65-75% FTP)",
    minFtp: 65,
    maxFtp: 75,
    description: "Aerobic base building with steady, comfortable efforts",
    value: "endurance",
  },

  tempo: {
    label: "Tempo (76-90% FTP)",
    minFtp: 76,
    maxFtp: 90,
    description: "Moderately hard efforts that improve efficiency at race pace",
    value: "tempo",
  },

  threshold: {
    label: "Threshold (95-105% FTP)",
    minFtp: 95,
    maxFtp: 105,
    description: "High-intensity efforts that push you to your limits",
    value: "threshold",
  },
  vo2max: {
    label: "VO2max (110-120% FTP)",
    minFtp: 110,
    maxFtp: 120,
    description: "Maximal efforts to improve oxygen uptake and efficiency",
    value: "vo2max",
  },
  anaerobic: {
    label: "Anaerobic (125-150% FTP)",
    minFtp: 125,
    maxFtp: 150,
    description: "High-intensity efforts that push you to your limits",
    value: "anaerobic",
  },
};

export type Step = {
  minutes: number;
  intensity: number;
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
}
