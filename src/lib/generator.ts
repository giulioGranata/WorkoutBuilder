import { PATTERNS } from "./patterns";
import { Step, Workout, WorkoutFormData } from "./types";

export function generateWorkout({
  ftp,
  durationMin,
  type,
}: WorkoutFormData): Workout {
  const adjustedFtp = ftp;

  // Warm-up and cool-down durations (~10% each)
  const warmupDuration = Math.max(5, Math.min(12, Math.floor(durationMin * 0.1)));
  const cooldownDuration = Math.max(5, Math.min(8, Math.floor(durationMin * 0.1)));
  const coreDuration = durationMin - warmupDuration - cooldownDuration;
  const isTooShort = durationMin < warmupDuration + cooldownDuration;

  const steps: Step[] = [];

  // Warm-up step
  steps.push({
    minutes: warmupDuration,
    intensity: Math.round(adjustedFtp * 0.6),
    description: "Easy warm-up pace to prepare for main efforts",
    phase: "warmup",
  });

  // Core workout from static patterns (random variant selection)
  const variants = PATTERNS[type];
  const chosen = variants[Math.floor(Math.random() * variants.length)];
  const coreSteps: Step[] = [];
  if (!isTooShort) {
    let remaining = coreDuration;
    let index = 0;
    while (remaining >= 1) {
      const block = chosen[index % chosen.length];
      const blockMinutes = Math.max(1, Math.round(block.minutes));

      let minutes: number;
      if (remaining < blockMinutes) {
        minutes = Math.floor(remaining);
        if (minutes < 1) {
          break;
        }
      } else {
        minutes = blockMinutes;
      }

      coreSteps.push({
        minutes,
        intensity: Math.round((block.intensityPct / 100) * ftp),
        description:
          block.description + (minutes < blockMinutes ? " (shortened)" : ""),
        phase: block.phase,
      });
      remaining -= minutes;
      index++;
    }
  }
  const validCoreSteps = coreSteps.filter((s) => s.minutes > 0);
  steps.push(...validCoreSteps);

  // Cool-down step
  steps.push({
    minutes: cooldownDuration,
    intensity: Math.round(adjustedFtp * 0.5),
    description: "Easy cool-down to aid recovery",
    phase: "cooldown",
  });

  const validSteps = steps.filter((s) => s.minutes > 0);

  const totalMinutes = validSteps.reduce((sum, step) => sum + step.minutes, 0);
  const workMinutes = validCoreSteps
    .filter((step) => step.phase === "work")
    .reduce((sum, step) => sum + step.minutes, 0);
  const recoveryMinutes = validCoreSteps
    .filter((step) => step.phase === "recovery")
    .reduce((sum, step) => sum + step.minutes, 0);
  const avgIntensity = Math.round(
    validSteps.reduce((sum, step) => sum + step.intensity * step.minutes, 0) /
      totalMinutes
  );

  const typeTitle =
    type === "vo2max" ? "VO2max" : type.charAt(0).toUpperCase() + type.slice(1);

  const workout: Workout = {
    title: `${typeTitle} — ${durationMin}'`,
    ftp,
    steps: validSteps,
    totalMinutes,
    workMinutes,
    recoveryMinutes,
    avgIntensity,
  };

  if (isTooShort) {
    workout.hint = "Increase duration to generate a complete workout";
  }

  return workout;
}
