import { describe, it, expect } from "vitest";
import { clamp, applyBias } from "./WorkoutOutput";

describe("bias helpers", () => {
  it("clamps values to the [75,125] range", () => {
    expect(clamp(50, 75, 125)).toBe(75);
    expect(clamp(130, 75, 125)).toBe(125);
    expect(clamp(100, 75, 125)).toBe(100);
  });

  it("never returns negative watt values when applying bias", () => {
    expect(applyBias(-100, 80)).toBe(0);
    expect(applyBias(200, 80)).toBe(160);
  });
});
