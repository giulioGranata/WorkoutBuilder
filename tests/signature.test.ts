import { describe, it, expect } from "vitest";
import { makeSignature } from "@/lib/signature";
import type { Step } from "@/lib/types";

describe("makeSignature", () => {
  it("includes ramp and steady markers", () => {
    const steps: Step[] = [
      { kind: "steady", minutes: 5, intensity: 200, description: "s", phase: "work" },
      { kind: "ramp", minutes: 10, from: 100, to: 150, description: "r", phase: "warmup" },
    ];
    expect(makeSignature(steps)).toBe("s:5:200:work|r:10:100:150:warmup");
  });
});
