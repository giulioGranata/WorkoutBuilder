import { PATTERNS } from "./patterns";
import {
  Step,
  Workout,
  WorkoutFormData,
  DurationRangeValue,
} from "./types";

const MAX_CAP = 240;

export function rangeToBounds(
  r: DurationRangeValue
): { min: number; max?: number } {
  switch (r) {
    case "30-45":
      return { min: 30, max: 45 };
    case "45-60":
      return { min: 45, max: 60 };
    case "60-75":
      return { min: 60, max: 75 };
    case "75-90":
      return { min: 75, max: 90 };
    case "90-plus":
      return { min: 90, max: undefined };
  }
}

export function generateWorkout({
  ftp,
  type,
  durationRange,
}: WorkoutFormData): Workout | null {
  const { min, max } = rangeToBounds(durationRange);

  // Warm-up and cool-down durations (~10% each of the min bound)
  const warmupDuration = Math.max(5, Math.min(12, Math.floor(min * 0.1)));
  const cooldownDuration = Math.max(5, Math.min(8, Math.floor(min * 0.1)));

  const coreBudgetMin = min - (warmupDuration + cooldownDuration);
  const cap = typeof max === "number" ? max : MAX_CAP;
  const coreBudgetMax = cap - (warmupDuration + cooldownDuration);

  if (coreBudgetMax < 1) return null;

  // Choose a pattern variant; if exactly one variant can fit, pick it deterministically
  const variants = PATTERNS[type];
  const withFit = variants
    .map((variant) => {
      const len = variant.reduce((sum, b) => sum + Math.round(b.minutes), 0);
      const k = Math.floor(coreBudgetMax / len);
      const total = warmupDuration + cooldownDuration + k * len;
      const fits = k >= 1 && total >= min;
      return { variant, len, k, total, fits };
    })
    .filter((x) => x.fits);

  if (withFit.length === 0) return null;

  const pick =
    withFit.length === 1
      ? withFit[0]
      : withFit[Math.floor(Math.random() * withFit.length)];

  const chosen = pick.variant;
  const cycleLen = pick.len;
  const k = pick.k;

  // Assemble steps: warm-up + k full cycles + cool-down (no truncation)
  const steps: Step[] = [];
  steps.push({
    minutes: warmupDuration,
    intensity: Math.round(ftp * 0.6),
    description: "Easy warm-up pace to prepare for main efforts",
    phase: "warmup",
  });

  for (let i = 0; i < k; i++) {
    for (const block of chosen) {
      const minutes = Math.round(block.minutes); // blocks are integer minutes
      steps.push({
        minutes,
        intensity: Math.round((block.intensityPct / 100) * ftp),
        description: block.description,
        phase: block.phase,
      });
    }
  }

  steps.push({
    minutes: cooldownDuration,
    intensity: Math.round(ftp * 0.5),
    description: "Easy cool-down to aid recovery",
    phase: "cooldown",
  });

  const total = steps.reduce((s, st) => s + st.minutes, 0);
  if (total < min) return null;

  const workMinutes = steps
    .filter((s) => s.phase === "work")
    .reduce((sum, s) => sum + s.minutes, 0);
  const recoveryMinutes = steps
    .filter((s) => s.phase === "recovery")
    .reduce((sum, s) => sum + s.minutes, 0);
  const avgIntensity = Math.round(
    steps.reduce((sum, s) => sum + s.intensity * s.minutes, 0) / total
  );

  const typeTitle =
    type === "vo2max" ? "VO2max" : type.charAt(0).toUpperCase() + type.slice(1);

  const workout: Workout = {
    title: `${typeTitle} — ${total}'`,
    ftp,
    steps,
    totalMinutes: total,
    workMinutes,
    recoveryMinutes,
    avgIntensity,
  };

  return workout;
}
