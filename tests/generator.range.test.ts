import { describe, it, expect, vi } from "vitest";
import { generateWorkout, rangeToBounds } from "@/lib/generator";

describe("generator with duration ranges (single-core)", () => {
  it("fits totals within 30–45 and 45–60 using tempo variants (no truncation)", () => {
    const cases: Array<{ val: "30-45" | "45-60"; type: "tempo" }>= [
      { val: "30-45", type: "tempo" },
      { val: "45-60", type: "tempo" },
    ];
    for (const { val, type } of cases) {
      const { min, max } = rangeToBounds(val);
      for (let i = 0; i < 10; i++) {
        const w = generateWorkout({ ftp: 250, type, durationRange: val });
        expect(w).not.toBeNull();
        const workout = w!;
        expect(workout.totalMinutes).toBeGreaterThanOrEqual(min);
        expect(workout.totalMinutes).toBeLessThanOrEqual(max!);
        const sum = workout.steps.reduce((s, st) => s + st.minutes, 0);
        expect(sum).toBe(workout.totalMinutes);
        expect(workout.steps.every((s) => s.minutes > 0)).toBe(true);
        expect(workout.steps.every((s) => !/shortened/i.test(s.description))).toBe(true);
      }
    }
  });

  it("returns null when no single variant fits (e.g., tempo 60–75)", () => {
    const res = generateWorkout({ ftp: 250, type: "tempo", durationRange: "60-75" });
    expect(res).toBeNull();
  });

  it("selects the only viable variant without randomization (endurance 30–45)", () => {
    // For endurance in 30–45, only variant C (35') fits with WU+CD=10
    const spy = vi.spyOn(Math, "random").mockReturnValue(0); // would pick A, but only C fits
    const res = generateWorkout({ ftp: 250, type: "endurance", durationRange: "30-45" });
    spy.mockRestore();
    expect(res).not.toBeNull();
    const workout = res!;
    const firstCore = workout.steps[1];
    expect(firstCore.description.startsWith("Endurance sustained 1")).toBe(true);
    expect(workout.totalMinutes).toBeGreaterThanOrEqual(30);
    expect(workout.totalMinutes).toBeLessThanOrEqual(45);
  });
});
