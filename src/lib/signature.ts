import { Step } from "./types";

/**
 * Create a unique runtime signature for a sequence of steps.
 * The signature uses minutes, intensity (or from/to if a ramp), and phase.
 * It's intended only for in-memory comparison of variants.
 */
export function makeSignature(steps: Step[]): string {
  return steps
    .map((s) => {
      const parts: (string | number)[] = [s.minutes];
      const anyStep = s as any;
      if (typeof anyStep.intensity === "number") {
        parts.push(anyStep.intensity);
      } else {
        if (typeof anyStep.from === "number") parts.push(anyStep.from);
        if (typeof anyStep.to === "number") parts.push(anyStep.to);
      }
      if (s.phase) parts.push(s.phase);
      return parts.join(":");
    })
    .join("|");
}

