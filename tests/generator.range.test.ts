import { describe, it, expect, vi } from "vitest";
import { generateWorkout, rangeToBounds } from "@/lib/generator";

describe("generator with duration ranges", () => {
  const ranges: Array<{
    val: "30-45" | "45-60" | "60-75" | "75-90" | "90-plus";
    type: "threshold" | "endurance" | "tempo" | "recovery" | "vo2max" | "anaerobic";
  }> = [
    { val: "30-45", type: "threshold" },
    { val: "45-60", type: "threshold" },
    { val: "60-75", type: "threshold" },
    { val: "75-90", type: "threshold" },
  ];

  it("fits totals within bounded ranges and no shortened steps", () => {
    for (const { val, type } of ranges) {
      const { min, max } = rangeToBounds(val);
      for (let i = 0; i < 10; i++) {
        const w = generateWorkout({ ftp: 250, type, durationRange: val });
        expect(w).not.toBeNull();
        const workout = w!;
        expect(workout.totalMinutes).toBeGreaterThanOrEqual(min);
        expect(max!).toBeDefined();
        expect(workout.totalMinutes).toBeLessThanOrEqual(max!);
        const sum = workout.steps.reduce((s, st) => s + st.minutes, 0);
        expect(sum).toBe(workout.totalMinutes);
        expect(workout.steps.every((s) => s.minutes > 0)).toBe(true);
        expect(workout.steps.every((s) => !/shortened/i.test(s.description))).toBe(true);
      }
    }
  });

  it("handles 90-plus with cap and min", () => {
    // Use endurance for a typical long pattern
    const w = generateWorkout({ ftp: 250, type: "endurance", durationRange: "90-plus" });
    expect(w).not.toBeNull();
    const workout = w!;
    expect(workout.totalMinutes).toBeGreaterThanOrEqual(90);
    expect(workout.totalMinutes).toBeLessThanOrEqual(240);
  });

  it("selects the only viable variant without randomization (endurance 30–45)", () => {
    // For endurance in 30–45, only variant C (35') fits with WU+CD=10
    const spy = vi.spyOn(Math, "random").mockReturnValue(0); // would pick A, but only C fits
    const res = generateWorkout({ ftp: 250, type: "endurance", durationRange: "30-45" });
    spy.mockRestore();
    expect(res).not.toBeNull();
    const workout = res!;
    // First core step should come from variant C
    const firstCore = workout.steps[1];
    expect(firstCore.description.startsWith("Endurance sustained 1")).toBe(true);
    expect(workout.totalMinutes).toBeGreaterThanOrEqual(30);
    expect(workout.totalMinutes).toBeLessThanOrEqual(45);
  });
});
