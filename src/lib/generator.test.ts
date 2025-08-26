import { describe, it, expect } from "vitest";
import { generateWorkout } from "./generator";

describe("generateWorkout", () => {
  it("total step minutes should equal requested duration", () => {
    const workout = generateWorkout({ ftp: 250, durationMin: 30, type: "recovery" });
    const total = workout.steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBe(30);
  });

  it("repeats pattern blocks and truncates final block", () => {
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

    // last step should be truncated to fit duration
    const lastStep = coreSteps[coreSteps.length - 1];
    expect(lastStep.minutes).toBe(13);

    // ensure no step shorter than 1 minute
    expect(coreSteps.every((s) => s.minutes >= 1)).toBe(true);

    // total minutes equals requested duration
    const total = workout.steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBe(60);
  });
});
