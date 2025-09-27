import { describe, it, expect } from "vitest";

import { getStepBounds } from "@/lib/workoutSteps";

describe("getStepBounds", () => {
  it("returns the same value for steady steps", () => {
    const steady = {
      minutes: 5,
      intensity: 200,
      phase: "work" as const,
      description: "steady effort",
    };
    expect(getStepBounds(steady)).toEqual([200, 200]);
  });

  it("keeps ascending ramps unchanged", () => {
    const rampUp = {
      minutes: 3,
      from: 150,
      to: 220,
      phase: "work" as const,
      description: "build power",
    };
    expect(getStepBounds(rampUp)).toEqual([150, 220]);
  });

  it("sorts descending ramps into ascending order", () => {
    const cooldownRamp = {
      minutes: 5,
      from: 200,
      to: 120,
      phase: "cooldown" as const,
      description: "ease down",
    };
    expect(getStepBounds(cooldownRamp)).toEqual([120, 200]);
  });
});
