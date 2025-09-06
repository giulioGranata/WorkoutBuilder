import { PATTERNS } from "./patterns";
import { makeSignature } from "./signature";
import {
  DurationRangeValue,
  Step,
  Workout,
  WorkoutFormData,
  isRampStep,
} from "./types";

const WARMUP_DURATION = 10;
const COOLDOWN_DURATION = 10;

const MAX_CAP = 240;

export function rangeToBounds(r: DurationRangeValue): {
  min: number;
  max?: number;
} {
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

export function generateWorkout(
  { ftp, type, durationRange }: WorkoutFormData,
  prevSignature?: string
): Workout | null {
  const { min, max } = rangeToBounds(durationRange);

  // Warm-up and cool-down durations (~10% each of the min bound)

  const cap = typeof max === "number" ? max : MAX_CAP;
  const coreBudgetMax = cap - (WARMUP_DURATION + COOLDOWN_DURATION);

  if (coreBudgetMax < 1) return null;

  const warmStep: Step = {
    kind: "ramp",
    minutes: WARMUP_DURATION,
    from: Math.round(ftp * 0.5),
    to: Math.round(ftp * 0.6),
    description: "Easy warm-up pace to prepare for main efforts",
    phase: "warmup",
  };
  const coolStep: Step = {
    kind: "ramp",
    minutes: COOLDOWN_DURATION,
    from: Math.round(ftp * 0.6),
    to: Math.round(ftp * 0.5),
    description: "Easy cool-down to aid recovery",
    phase: "cooldown",
  };
  const warmSig = makeSignature([warmStep]);
  const coolSig = makeSignature([coolStep]);

  // Choose a pattern variant; if exactly one variant can fit, pick it deterministically
  const variants = PATTERNS[type];
  const withFit = variants
    .map((variant) => {
      const coreSteps: Step[] = variant.map((block) => ({
        kind: "steady",
        minutes: block.minutes,
        intensity: Math.round(ftp * (block.intensityPct / 100)),
        description: block.description,
        phase: block.phase,
      }));
      const len = coreSteps.reduce((sum, b) => sum + Math.round(b.minutes), 0);
      const total = WARMUP_DURATION + len + COOLDOWN_DURATION;
      const fits = total >= min && total <= cap;
      const signature = [warmSig, makeSignature(coreSteps), coolSig].join("|");
      return { coreSteps, len, total, fits, signature };
    })
    .filter((x) => x.fits);

  if (withFit.length === 0) return null;

  let pickIndex = 0;
  if (withFit.length === 1) {
    pickIndex = 0;
  } else {
    pickIndex = Math.floor(Math.random() * withFit.length);
    if (withFit[pickIndex].signature === prevSignature) {
      pickIndex = (pickIndex + 1) % withFit.length;
    }
  }
  const pick = withFit[pickIndex];

  // Assemble steps: warm-up + k full cycles + cool-down (no truncation)
  const steps: Step[] = [];
  steps.push(warmStep);

  // Single core block (no repetition)
  pick.coreSteps.forEach((block) => {
    steps.push(block);
  });

  steps.push(coolStep);

  const total = steps.reduce((s, st) => s + st.minutes, 0);
  if (total < min) return null;

  const workMinutes = steps
    .filter((s) => s.phase === "work")
    .reduce((sum, s) => sum + s.minutes, 0);
  const recoveryMinutes = steps
    .filter((s) => s.phase === "recovery")
    .reduce((sum, s) => sum + s.minutes, 0);
  const avgIntensity = Math.round(
    steps.reduce((sum, s) => {
      if (isRampStep(s)) {
        return sum + ((s.from + s.to) / 2) * s.minutes;
      }
      return sum + s.intensity * s.minutes;
    }, 0) / total
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
    signature: makeSignature(steps),
  };

  return workout;
}
