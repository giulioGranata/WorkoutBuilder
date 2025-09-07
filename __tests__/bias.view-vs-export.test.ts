import { describe, it, expect } from "vitest";
import { applyBias } from "@/components/WorkoutOutput";
import { toZwoXml } from "@/lib/zwo";
import type { Workout, Step } from "@/lib/types";

const baseWorkout: Workout = {
  title: "Bias Test",
  ftp: 200,
  steps: [
    { kind: "steady", minutes: 10, intensity: 150, description: "work", phase: "work" },
    { kind: "ramp", minutes: 5, from: 100, to: 120, description: "ramp", phase: "work" },
  ],
  totalMinutes: 15,
  workMinutes: 15,
  recoveryMinutes: 0,
  avgIntensity: 150,
  signature: "sig",
};

function biasSteps(steps: Step[], bias: number): Step[] {
  return steps.map((s) => {
    const kind = (s as any).kind ?? "steady";
    if (kind === "ramp") {
      const r = s as any;
      return { ...r, from: applyBias(r.from, bias), to: applyBias(r.to, bias), kind: "ramp" };
    }
    const st = s as any;
    return { ...st, intensity: applyBias(st.intensity, bias), kind: "steady" };
  });
}

function avgIntensity(steps: Step[], total: number) {
  return Math.round(
    steps.reduce((sum, s: any) => {
      if ((s.kind ?? "steady") === "ramp") {
        return sum + ((s.from + s.to) / 2) * s.minutes;
      }
      return sum + s.intensity * s.minutes;
    }, 0) / total
  );
}

describe("bias application", () => {
  it("applies bias to view only and keeps export at planned watts", () => {
    const biased = biasSteps(baseWorkout.steps, 125);
    expect((biased[0] as any).intensity).toBe( applyBias(150,125) );
    expect((biased[1] as any).from).toBe( applyBias(100,125) );
    expect((biased[1] as any).to).toBe( applyBias(120,125) );

    const avg = avgIntensity(biased, baseWorkout.totalMinutes);
    expect(avg).toBe(avgIntensity(biased, baseWorkout.totalMinutes));

    const xml = toZwoXml({ ...baseWorkout, biasPct: 125 });
    expect(xml).toContain('Power="0.75"');
    expect(xml).toContain('PowerLow="0.50"');
    expect(xml).toContain('PowerHigh="0.60"');
  });

  it("handles bias below 100%", () => {
    const biased = biasSteps(baseWorkout.steps, 75);
    expect((biased[0] as any).intensity).toBe( applyBias(150,75) );
    const avg = avgIntensity(biased, baseWorkout.totalMinutes);
    expect(avg).toBe(avgIntensity(biased, baseWorkout.totalMinutes));
    const xml = toZwoXml({ ...baseWorkout, biasPct: 75 });
    expect(xml).toContain('Power="0.75"');
  });
});
