import type { Workout } from "./types";

export function getSignature(workout: Workout): string {
  return workout.steps
    .map((s) => {
      if ("kind" in s && s.kind === "ramp") {
        return `r:${s.minutes}:${s.from}:${s.to}:${s.phase}`;
      }
      const intensity = (s as any).intensity;
      return `s:${s.minutes}:${intensity}:${s.phase}`;
    })
    .join("|");
}
