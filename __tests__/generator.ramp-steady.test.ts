import { describe, it, expect } from "vitest";
import { generateWorkout, rangeToBounds } from "@/lib/generator";

const FTP = 200;

describe("generator ramp & steady steps", () => {
  it("creates warmup/cooldown ramps and steady core with correct metrics", () => {
    const workout = generateWorkout({
      ftp: FTP,
      type: "threshold",
      durationRange: "60-75",
    });
    expect(workout).not.toBeNull();
    const w = workout!;

    const warm = w.steps[0] as any;
    expect(warm.phase).toBe("warmup");
    expect(warm.kind).toBe("ramp");
    expect(warm.from).toBeCloseTo(FTP * 0.5, 0);
    expect(warm.to).toBeCloseTo(FTP * 0.6, 0);
    expect(warm.minutes).toBeGreaterThanOrEqual(5);
    expect(warm.minutes).toBeLessThanOrEqual(12);

    const cool = w.steps[w.steps.length - 1] as any;
    expect(cool.phase).toBe("cooldown");
    expect(cool.kind).toBe("ramp");
    expect(cool.from).toBeCloseTo(FTP * 0.6, 0);
    expect(cool.to).toBeCloseTo(FTP * 0.5, 0);
    expect(cool.minutes).toBeGreaterThan(0);

    const core = w.steps.slice(1, -1);
    const hasSteadyWork = core.some(
      (s: any) => s.phase === "work" && (s.kind ?? "steady") === "steady"
    );
    expect(hasSteadyWork).toBe(true);

    const totalMinutes = w.steps.reduce((sum, s) => sum + s.minutes, 0);
    const workMinutes = w.steps
      .filter((s) => s.phase === "work")
      .reduce((sum, s) => sum + s.minutes, 0);
    const recoveryMinutes = w.steps
      .filter((s) => s.phase === "recovery")
      .reduce((sum, s) => sum + s.minutes, 0);

    expect(w.totalMinutes).toBe(totalMinutes);
    expect(w.workMinutes).toBe(workMinutes);
    expect(w.recoveryMinutes).toBe(recoveryMinutes);

    const avg = Math.round(
      w.steps.reduce((sum, s: any) => {
        if ((s.kind ?? "steady") === "ramp") {
          return sum + ((s.from + s.to) / 2) * s.minutes;
        }
        return sum + s.intensity * s.minutes;
      }, 0) / totalMinutes
    );
    expect(w.avgIntensity).toBe(avg);

    const { min, max } = rangeToBounds("60-75");
    expect(w.totalMinutes).toBeGreaterThanOrEqual(min);
    if (max) expect(w.totalMinutes).toBeLessThanOrEqual(max);
  });
});
