import { describe, it, expect } from "vitest";
import { computeNP, computeTSS } from "../metrics";
import type { Step } from "../types";

describe("metrics", () => {
  it("computes NP and TSS with bias-aware intensities", () => {
    const ftp = 250;
    const steps: Step[] = [
      { minutes: 60, intensity: Math.round(ftp * 0.8), phase: "work", description: "" },
    ];
    const np = computeNP(steps, ftp);
    expect(np).toBeCloseTo(ftp * 0.8, 0); // 200W
    const tss = computeTSS(60, np, ftp);
    expect(tss).toBe(64);

    const biasedSteps: Step[] = [
      { minutes: 60, intensity: Math.round(ftp * 0.8 * 1.1), phase: "work", description: "" },
    ];
    const npBias = computeNP(biasedSteps, ftp);
    const tssBias = computeTSS(60, npBias, ftp);
    expect(tssBias).toBeGreaterThan(tss);
  });
});

