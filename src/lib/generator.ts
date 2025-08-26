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

  const steps: Step[] = [];

  // Warm-up step
  steps.push({
    minutes: warmupDuration,
    intensity: Math.round(adjustedFtp * 0.6),
    description: "Easy warm-up pace to prepare for main efforts",
    phase: "warmup",
  });

  // Core workout from static patterns
  const pattern = PATTERNS[type];
  const coreSteps: Step[] = [];
  let remaining = coreDuration;
  let index = 0;
  while (remaining > 0) {
    const block = pattern[index % pattern.length];
    const blockMinutes = Math.max(1, block.minutes);
    let minutes = Math.min(blockMinutes, remaining);
    if (minutes < 1) {
      // roll leftover time into previous step to avoid very short blocks
      if (coreSteps.length) {
        coreSteps[coreSteps.length - 1].minutes += remaining;
      }
      remaining = 0;
      break;
    }
    coreSteps.push({
      minutes,
      intensity: Math.round((block.intensityPct / 100) * ftp),
      description: block.description + (minutes < blockMinutes ? " (truncated)" : ""),
      phase: block.phase,
    });
    remaining -= minutes;
    index++;
  }
  steps.push(...coreSteps);

  // Cool-down step
  steps.push({
    minutes: cooldownDuration,
    intensity: Math.round(adjustedFtp * 0.5),
    description: "Easy cool-down to aid recovery",
    phase: "cooldown",
  });

  const totalMinutes = steps.reduce((sum, step) => sum + step.minutes, 0);
  const workMinutes = coreSteps
    .filter((step) => step.phase === "work")
    .reduce((sum, step) => sum + step.minutes, 0);
  const recoveryMinutes = coreSteps
    .filter((step) => step.phase === "recovery")
    .reduce((sum, step) => sum + step.minutes, 0);
  const avgIntensity = Math.round(
    steps.reduce((sum, step) => sum + step.intensity * step.minutes, 0) /
      totalMinutes
  );

  const typeTitle =
    type === "vo2max" ? "VO2max" : type.charAt(0).toUpperCase() + type.slice(1);

  return {
    title: `${typeTitle} — ${durationMin}'`,
    ftp,
    steps,
    totalMinutes,
    workMinutes,
    recoveryMinutes,
    avgIntensity,
  };
}
