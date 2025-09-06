import { describe, it, expect } from "vitest";
import {
  type RampStep,
  type SteadyStep,
  type Step,
  isRampStep,
  isSteadyStep,
} from "@/lib/types";

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

  it("type guards discriminate step kinds", () => {
    const steady: Step = {
      minutes: 5,
      intensity: 180,
      description: "s",
      phase: "work",
    };
    const ramp: Step = {
      kind: "ramp",
      minutes: 3,
      from: 100,
      to: 150,
      description: "r",
      phase: "warmup",
    };
    expect(isRampStep(steady)).toBe(false);
    expect(isSteadyStep(steady)).toBe(true);
    expect(isRampStep(ramp)).toBe(true);
    expect(isSteadyStep(ramp)).toBe(false);
  });
});
