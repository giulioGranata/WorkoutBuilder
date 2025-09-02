import { describe, it, expect, vi } from "vitest";
import { generateWorkout } from "./generator";

describe("generateWorkout (range model, single-core)", () => {
  it("randomizes variants across generations (at least two distinct)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const w = generateWorkout({ ftp: 250, durationRange: "45-60", type: "tempo" });
      expect(w).not.toBeNull();
      const firstCore = w!.steps[1];
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
      const w = generateWorkout({ ftp: 250, durationRange: "45-60", type: "tempo" });
      spy.mockRestore();
      expect(w).not.toBeNull();
      const firstCore = w!.steps[1];
      expect(firstCore.description.startsWith(expectedDesc)).toBe(true);
    }
  });

  it("never produces steps with 0 minutes or shortened labels", () => {
    const cases = [
      { ftp: 250, durationRange: "30-45" as const, type: "tempo" as const },
      { ftp: 250, durationRange: "60-75" as const, type: "endurance" as const },
      { ftp: 250, durationRange: "45-60" as const, type: "endurance" as const },
    ];

    for (const args of cases) {
      const w = generateWorkout(args);
      if (!w) continue;
      expect(w.steps.every((s) => s.minutes > 0)).toBe(true);
      expect(w.steps.every((s) => !/shortened/i.test(s.description))).toBe(true);
    }
  });
});
