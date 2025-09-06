import { Step } from "./types";

/**
 * Create a unique runtime signature for a sequence of steps.
 * The signature uses minutes, intensity (or from/to if a ramp), and phase.
 * It's intended only for in-memory comparison of variants.
 */
export function makeSignature(steps: Step[]): string {
  return steps
    .map((s) => {
      const kind = (s as any).kind ?? "steady";
      if (kind === "ramp") {
        const rs = s as any;
        return `r:${rs.minutes}:${rs.from}:${rs.to}${rs.phase ? `:${rs.phase}` : ""}`;
      }
      const ss = s as any;
      return `s:${ss.minutes}:${ss.intensity}${ss.phase ? `:${ss.phase}` : ""}`;
    })
    .join("|");
}

