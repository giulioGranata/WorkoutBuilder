import { describe, it, expect } from "vitest";
import { colorForStep } from "@/components/WorkoutChart";
import { applyBias } from "@/lib/workoutSteps";
import type { Step } from "@/lib/types";

const FTP = 200;

function makeRamp(from: number, to: number, phase: "work" | "warmup" | "cooldown" = "work"): Step {
  return { kind: "ramp", minutes: 5, from, to, description: "", phase } as any;
}
function makeSteady(intensity: number): Step {
  return { kind: "steady", minutes: 5, intensity, description: "", phase: "work" } as any;
}

describe("zone colors", () => {
  it("maps warmup and cooldown to grey", () => {
    expect(colorForStep(makeRamp(100,120,"warmup"), FTP)).toBe("var(--phase-warmup)");
    expect(colorForStep(makeRamp(120,100,"cooldown"), FTP)).toBe("var(--phase-cooldown)");
  });

  it("maps steady and ramp steps by average intensity", () => {
    expect(colorForStep(makeSteady(100), FTP)).toBe("var(--z1)"); // 50%
    expect(colorForStep(makeSteady(130), FTP)).toBe("var(--z2)"); // 65%
    expect(colorForStep(makeSteady(170), FTP)).toBe("var(--z3)"); // 85%
    expect(colorForStep(makeSteady(200), FTP)).toBe("var(--z4)"); // 100%
    expect(colorForStep(makeSteady(230), FTP)).toBe("var(--z5)"); // 115%
    expect(colorForStep(makeSteady(260), FTP)).toBe("var(--z6)"); // 130%

    const ramp = makeRamp(100, 160);
    const biasedRamp = {
      ...ramp,
      from: applyBias((ramp as any).from, 120),
      to: applyBias((ramp as any).to, 120),
    } as any;
    expect(colorForStep(biasedRamp, FTP)).toBe("var(--z3)");
  });
});
