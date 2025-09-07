import { describe, it, expect } from "vitest";
import type { RampStep, SteadyStep, Step } from "@/lib/types";

describe("Step type definitions", () => {
  it("accepts steady and ramp steps", () => {
    const steady: SteadyStep = {
      kind: "steady",
      minutes: 5,
      intensity: 200,
      description: "steady",
      phase: "work",
    };
    const ramp: RampStep = {
      kind: "ramp",
      minutes: 5,
      from: 100,
      to: 150,
      description: "ramp",
      phase: "warmup",
    };
    const steps: Step[] = [steady, ramp];
    expect(steps.length).toBe(2);
  });
});
