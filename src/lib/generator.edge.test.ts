import { describe, it, expect } from "vitest";
import { generateWorkout } from "./generator";

describe("generateWorkout edge cases (ranges)", () => {
  it("warm-up and cool-down durations respect bounds derived from min", () => {
    const cases = [
      { range: "30-45" as const, warmup: 5, cooldown: 5 }, // 10% of 30 => 3, clamped to 5 & 5
      { range: "60-75" as const, warmup: 6, cooldown: 6 }, // 10% of 60 => 6 & 6
      { range: "90-plus" as const, warmup: 9, cooldown: 8 }, // 10% of 90 => 9 & 8 (cooldown capped at 8)
    ];

    for (const { range, warmup, cooldown } of cases) {
      const workout = generateWorkout({ ftp: 250, durationRange: range, type: "recovery" });
      if (!workout) continue; // in rare case of no fit
      expect(workout.steps[0].minutes).toBe(warmup);
      expect(workout.steps[workout.steps.length - 1].minutes).toBe(cooldown);
    }
  });
});
