import { describe, it, expect } from "vitest";
import { generateWorkout } from "./generator";

describe("generateWorkout", () => {
  it("total step minutes should equal requested duration", () => {
    const workout = generateWorkout({ ftp: 250, durationMin: 30, type: "recovery" });
    const total = workout.steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBe(30);
  });

  it("repeats pattern blocks and shortens final block", () => {
    const ftp = 200;
    const workout = generateWorkout({ ftp, durationMin: 60, type: "tempo" });

    // remove warm-up and cool-down
    const coreSteps = workout.steps.slice(1, -1);

    // first step comes from tempo pattern (15 min at 85% FTP)
    expect(coreSteps[0]).toMatchObject({
      minutes: 15,
      intensity: Math.round(ftp * 0.85),
      phase: "work",
    });

    // last step should be shortened to fit duration
    const lastStep = coreSteps[coreSteps.length - 1];
    expect(lastStep.description.endsWith("(shortened)")).toBe(true);
    expect(lastStep.minutes).toBeGreaterThanOrEqual(1);

    // ensure no step shorter than 1 minute
    expect(coreSteps.every((s) => s.minutes >= 1)).toBe(true);
    expect(workout.steps.every((s) => s.minutes >= 1)).toBe(true);

    // total minutes equals requested duration
    const total = workout.steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBe(60);
  });

  it("handles core remainder under one minute without extra step", () => {
    const durationMin = 30.6;
    const workout = generateWorkout({ ftp: 250, durationMin, type: "recovery" });

    // core should still be represented by a single step
    const coreSteps = workout.steps.slice(1, -1);
    expect(coreSteps).toHaveLength(1);

    // total duration preserved
    const total = workout.steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBeCloseTo(durationMin, 5);

    // ensure no zero-minute steps
    expect(workout.steps.every((s) => s.minutes >= 1)).toBe(true);
  });

  it("returns warm-up and cool-down with hint for durations < 10", () => {
    const workout = generateWorkout({ ftp: 250, durationMin: 5, type: "recovery" });
    expect(workout.steps).toHaveLength(2);
    expect(workout.steps[0].phase).toBe("warmup");
    expect(workout.steps[1].phase).toBe("cooldown");
    expect(workout.totalMinutes).toBe(10);
    expect(workout.hint).toBe("Increase duration to generate a complete workout");
    expect(workout.steps.every((s) => s.minutes > 0)).toBe(true);
  });

  it("never produces steps with 0 minutes", () => {
    const cases = [
      { ftp: 250, durationMin: 20, type: "tempo" },
      { ftp: 250, durationMin: 60, type: "tempo" },
      { ftp: 250, durationMin: 30.6, type: "recovery" },
    ];

    for (const args of cases) {
      const workout = generateWorkout(args);
      expect(workout.steps.every((s) => s.minutes > 0)).toBe(true);
    }
  });
});
