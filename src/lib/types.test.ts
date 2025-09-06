import { describe, it, expectTypeOf } from "vitest";
import type { Step, SteadyStep, RampStep } from "./types";

describe("Step types", () => {
  it("supports steady and ramp steps and legacy steady", () => {
    const steady: SteadyStep = {
      kind: "steady",
      minutes: 5,
      intensity: 200,
      phase: "work",
      description: "",
    };
    const ramp: RampStep = {
      kind: "ramp",
      minutes: 5,
      from: 100,
      to: 150,
      phase: "warmup",
      description: "",
    };
    const legacy: Step = {
      minutes: 5,
      intensity: 180,
      phase: "work",
      description: "legacy",
    };
    const steps: Step[] = [steady, ramp, legacy];
    expectTypeOf(steps[0]).toMatchTypeOf<Step>();
    expectTypeOf(steps[1]).toMatchTypeOf<Step>();
    expectTypeOf(steps[2]).toMatchTypeOf<Step>();
  });
});
