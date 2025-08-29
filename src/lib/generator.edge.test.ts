import { describe, it, expect } from "vitest";
import { generateWorkout } from "./generator";

describe("generateWorkout edge cases", () => {
  it("warm-up and cool-down durations respect bounds", () => {
    const cases = [
      { durationMin: 20, warmup: 5, cooldown: 5 },
      { durationMin: 60, warmup: 6, cooldown: 6 },
      { durationMin: 200, warmup: 12, cooldown: 8 },
    ];

    for (const { durationMin, warmup, cooldown } of cases) {
      const workout = generateWorkout({ ftp: 250, durationMin, type: "recovery" });
      expect(workout.steps[0].minutes).toBe(warmup);
      expect(workout.steps[workout.steps.length - 1].minutes).toBe(cooldown);
    }
  });

  it("adds hint when duration below warm-up and cool-down sum", () => {
    const workout = generateWorkout({ ftp: 200, durationMin: 9, type: "recovery" });
    expect(workout.hint).toBe(
      "Increase duration to generate a complete workout"
    );
    expect(workout.steps[0].minutes + workout.steps[workout.steps.length - 1].minutes).toBe(
      10
    );
  });
});
