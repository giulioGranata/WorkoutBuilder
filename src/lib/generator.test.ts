import { describe, it, expect, vi } from "vitest";
import { generateWorkout } from "./generator";

describe("generateWorkout", () => {
  it("total step minutes should equal requested duration", () => {
    const workout = generateWorkout({ ftp: 250, durationMin: 30, type: "recovery" });
    const total = workout.steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBe(30);
  });

  it("creates ramp steps for warm-up and cool-down with correct targets", () => {
    const ftp = 200;
    const workout = generateWorkout({ ftp, durationMin: 40, type: "endurance" });
    const warm = workout.steps[0];
    const cool = workout.steps[workout.steps.length - 1];
    expect((warm as any).kind).toBe("ramp");
    expect((cool as any).kind).toBe("ramp");
    expect((warm as any).from).toBe(Math.round(ftp * 0.5));
    expect((warm as any).to).toBe(Math.round(ftp * 0.6));
    expect((cool as any).from).toBe(Math.round(ftp * 0.6));
    expect((cool as any).to).toBe(Math.round(ftp * 0.5));
  });

  it("computes avg intensity using ramp averages", () => {
    const ftp = 200;
    const w = generateWorkout({ ftp, durationMin: 9, type: "recovery" });
    expect(w.steps).toHaveLength(2); // only warmup/cooldown
    expect(w.avgIntensity).toBe(110);
  });

  it("repeats chosen variant and shortens final block when needed", () => {
    const ftp = 200;
    const spy = vi.spyOn(Math, "random").mockReturnValue(0); // pick variant A
    const workout = generateWorkout({ ftp, durationMin: 60, type: "tempo" });
    spy.mockRestore();

    // remove warm-up and cool-down
    const coreSteps = workout.steps.slice(1, -1);

    // first step from tempo A (15 min at 85% FTP)
    expect(coreSteps[0]).toMatchObject({
      minutes: 15,
      intensity: Math.round(ftp * 0.85),
      phase: "work",
    });

    // last step may be shortened to fit duration
    const lastStep = coreSteps[coreSteps.length - 1];
    if (lastStep.description.endsWith("(shortened)")) {
      expect(lastStep.minutes).toBeGreaterThanOrEqual(1);
    }

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

    // core should not create an extra shortened step
    const coreSteps = workout.steps.slice(1, -1);
    const hasShortened = coreSteps.some((s) => s.description.endsWith("(shortened)"));
    expect(hasShortened).toBe(false);

    // total duration is rounded down to whole minutes
    const total = workout.steps.reduce((sum, step) => sum + step.minutes, 0);
    expect(total).toBe(Math.floor(durationMin));

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

  it("randomizes variants across generations (at least two distinct)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const w = generateWorkout({ ftp: 250, durationMin: 60, type: "tempo" });
      const firstCore = w.steps[1];
      seen.add(firstCore.description);
      if (seen.size >= 2) break;
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });

  it("picks variant A/B/C based on Math.random mock", () => {
    const picks: Array<{ r: number; expectedDesc: string }> = [
      { r: 0.0, expectedDesc: "Tempo block 1" }, // A
      { r: 0.4, expectedDesc: "Tempo effort 1" }, // B
      { r: 0.9, expectedDesc: "Tempo sustained 1" }, // C
    ];

    for (const { r, expectedDesc } of picks) {
      const spy = vi.spyOn(Math, "random").mockReturnValue(r);
      const w = generateWorkout({ ftp: 250, durationMin: 45, type: "tempo" });
      spy.mockRestore();
      const firstCore = w.steps[1];
      expect(firstCore.description.startsWith(expectedDesc)).toBe(true);
    }
  });

  it("ensures total minutes match requested with varying variants", () => {
    const durations = [35, 50, 75];
    const types: Array<"recovery" | "endurance" | "tempo" | "threshold" | "vo2max" | "anaerobic"> = [
      "recovery",
      "endurance",
      "tempo",
      "threshold",
      "vo2max",
      "anaerobic",
    ];
    for (const d of durations) {
      for (const t of types) {
        const w = generateWorkout({ ftp: 250, durationMin: d, type: t });
        const total = w.steps.reduce((sum, s) => sum + s.minutes, 0);
        expect(total).toBe(d);
        expect(w.steps.every((s) => s.minutes >= 1)).toBe(true);
      }
    }
  });

  it("applies '(shortened)' label and no 0' steps for all variants (tempo, 61')", () => {
    const picks = [0.0, 0.4, 0.9]; // A, B, C
    for (const r of picks) {
      const spy = vi.spyOn(Math, "random").mockReturnValue(r);
      const w = generateWorkout({ ftp: 250, durationMin: 61, type: "tempo" });
      spy.mockRestore();
      // Core steps only
      const core = w.steps.slice(1, -1);
      expect(core.every((s) => s.minutes >= 1)).toBe(true);
      const shortenedExists = core.some((s) => s.description.endsWith("(shortened)"));
      expect(shortenedExists).toBe(true);
    }
  });
});
