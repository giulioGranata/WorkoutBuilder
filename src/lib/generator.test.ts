import { describe, it, expect } from "vitest";
import { generateWorkout } from "./generator";
import { generateVO2MaxSteps } from "./generator";

describe("generateWorkout", () => {
  it("total step minutes should equal requested duration", () => {
    const workout = generateWorkout({ ftp: 250, durationMin: 30, type: "recovery" });
    const total = workout.steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBe(30);
  });
});

describe("generateVO2MaxSteps", () => {
  it("includes final interval when duration is not multiple of 3", () => {
    const steps = generateVO2MaxSteps(250, 10);
    const total = steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBe(10);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe("work");
    expect(lastStep.minutes).toBe(1);
  });
});
