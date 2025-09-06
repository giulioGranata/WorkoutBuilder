import { Step, isRampStep } from "./types";

/**
 * Create a unique runtime signature for a sequence of steps.
 * The signature uses minutes, intensity (or from/to if a ramp), and phase.
 * It's intended only for in-memory comparison of variants.
 */
export function makeSignature(steps: Step[]): string {
  return steps
    .map((s) =>
      isRampStep(s)
        ? `r:${s.minutes}:${s.from}:${s.to}${s.phase ? `:${s.phase}` : ""}`
        : `s:${s.minutes}:${s.intensity}${s.phase ? `:${s.phase}` : ""}`
    )
    .join("|");
}

