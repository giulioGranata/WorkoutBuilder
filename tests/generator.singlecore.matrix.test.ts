import { describe, it, expect } from "vitest";
import { generateWorkout } from "@/lib/generator";

type Range = "30-45" | "45-60" | "60-75" | "75-90" | "90-plus";
type WType = "recovery" | "endurance" | "tempo" | "threshold" | "vo2max" | "anaerobic";

// Expected feasibility matrix for single-core logic
// true = at least one variant fits warmup+core+cooldown within the range
const EXPECTS: Record<WType, Record<Range, boolean>> = {
  recovery:   { "30-45": true,  "45-60": false, "60-75": false, "75-90": false, "90-plus": false },
  endurance:  { "30-45": true,  "45-60": true,  "60-75": false, "75-90": false, "90-plus": false },
  tempo:      { "30-45": true,  "45-60": true,  "60-75": false, "75-90": false, "90-plus": false },
  threshold:  { "30-45": true,  "45-60": true,  "60-75": false, "75-90": false, "90-plus": false },
  vo2max:     { "30-45": true,  "45-60": true,  "60-75": false, "75-90": false, "90-plus": false },
  anaerobic:  { "30-45": false, "45-60": false, "60-75": false, "75-90": false, "90-plus": false },
};

describe("single-core feasibility matrix", () => {
  const ranges: Range[] = ["30-45", "45-60", "60-75", "75-90", "90-plus"];
  const types: WType[] = ["recovery", "endurance", "tempo", "threshold", "vo2max", "anaerobic"];

  for (const t of types) {
    for (const r of ranges) {
      it(`${t} ${r} -> ${EXPECTS[t][r] ? "fits" : "no fit"}`, () => {
        const w = generateWorkout({ ftp: 250, type: t, durationRange: r });
        if (EXPECTS[t][r]) {
          expect(w).not.toBeNull();
          const total = w!.steps.reduce((s, st) => s + st.minutes, 0);
          expect(total).toBe(w!.totalMinutes);
          expect(w!.steps.every((s) => s.minutes > 0)).toBe(true);
        } else {
          expect(w).toBeNull();
        }
      });
    }
  }
});

describe("deterministic single-fit selection", () => {
  it("tempo 30–45 -> variant A (first core: Tempo block 1)", () => {
    const w = generateWorkout({ ftp: 250, type: "tempo", durationRange: "30-45" });
    expect(w).not.toBeNull();
    const firstCore = w!.steps[1];
    expect(firstCore.description.startsWith("Tempo block 1")).toBe(true);
  });

  it("threshold 30–45 -> variant B (first core: Threshold sustained 1)", () => {
    const w = generateWorkout({ ftp: 250, type: "threshold", durationRange: "30-45" });
    expect(w).not.toBeNull();
    const firstCore = w!.steps[1];
    expect(firstCore.description.startsWith("Threshold sustained 1")).toBe(true);
  });

  it("endurance 30–45 -> variant C (first core: Endurance sustained 1)", () => {
    const w = generateWorkout({ ftp: 250, type: "endurance", durationRange: "30-45" });
    expect(w).not.toBeNull();
    const firstCore = w!.steps[1];
    expect(firstCore.description.startsWith("Endurance sustained 1")).toBe(true);
  });

  it("vo2max 45–60 -> variant A (first core: VO2 interval 1)", () => {
    const w = generateWorkout({ ftp: 250, type: "vo2max", durationRange: "45-60" });
    expect(w).not.toBeNull();
    const firstCore = w!.steps[1];
    expect(firstCore.description.startsWith("VO2 interval 1")).toBe(true);
  });
});

describe("randomization when multiple variants fit", () => {
  it("tempo 45–60 yields at least two distinct first-core blocks across runs", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const w = generateWorkout({ ftp: 250, type: "tempo", durationRange: "45-60" });
      expect(w).not.toBeNull();
      const firstCore = w!.steps[1].description;
      seen.add(firstCore);
      if (seen.size >= 2) break;
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });

  it("endurance 45–60 randomizes among fitting variants", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const w = generateWorkout({ ftp: 250, type: "endurance", durationRange: "45-60" });
      expect(w).not.toBeNull();
      const firstCore = w!.steps[1].description;
      seen.add(firstCore);
      if (seen.size >= 2) break;
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });

  it("vo2max 30–45 randomizes among fitting variants", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const w = generateWorkout({ ftp: 250, type: "vo2max", durationRange: "30-45" });
      expect(w).not.toBeNull();
      const firstCore = w!.steps[1].description;
      seen.add(firstCore);
      if (seen.size >= 2) break;
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });
});

describe("warmup/cooldown derived from min bound", () => {
  it("30–45 => warmup 5, cooldown 5", () => {
    const w = generateWorkout({ ftp: 250, type: "tempo", durationRange: "30-45" });
    expect(w).not.toBeNull();
    const steps = w!.steps;
    expect(steps[0].phase).toBe("warmup");
    expect(steps[0].minutes).toBe(5);
    expect(steps[steps.length - 1].phase).toBe("cooldown");
    expect(steps[steps.length - 1].minutes).toBe(5);
  });

  it("45–60 => warmup 5, cooldown 5", () => {
    const w = generateWorkout({ ftp: 250, type: "tempo", durationRange: "45-60" });
    expect(w).not.toBeNull();
    const steps = w!.steps;
    expect(steps[0].minutes).toBe(5);
    expect(steps[steps.length - 1].minutes).toBe(5);
  });
});

