import { describe, it, expect, vi } from "vitest";
describe("generateWorkout", () => {
  it("creates workout with warmup, core, cooldown and correct metrics", async () => {
    const { generateWorkout } = await import("@/lib/generator");
    const result = generateWorkout({ ftp: 250, type: "tempo", durationRange: "45-60" });
    expect(result).not.toBeNull();
    const workout = result!;
    expect(workout.steps[0].phase).toBe("warmup");
    expect((workout.steps[0] as any).kind).toBe("ramp");
    expect(workout.steps[workout.steps.length - 1].phase).toBe("cooldown");
    expect((workout.steps[workout.steps.length - 1] as any).kind).toBe("ramp");
    expect(workout.steps.length).toBeGreaterThanOrEqual(3);

    const totalMinutes = workout.steps.reduce((sum, s) => sum + s.minutes, 0);
    expect(workout.totalMinutes).toBe(totalMinutes);
    expect(workout.title).toContain(`${totalMinutes}'`);

    const workMinutes = workout.steps
      .filter((s) => s.phase === "work")
      .reduce((sum, s) => sum + s.minutes, 0);
    const recoveryMinutes = workout.steps
      .filter((s) => s.phase === "recovery")
      .reduce((sum, s) => sum + s.minutes, 0);
    expect(workout.workMinutes).toBe(workMinutes);
    expect(workout.recoveryMinutes).toBe(recoveryMinutes);

    const avgIntensity = Math.round(
      workout.steps.reduce((sum, s) => {
        const kind = (s as any).kind ?? "steady";
        if (kind === "ramp") {
          return sum + ((s as any).from + (s as any).to) / 2 * s.minutes;
        }
        return sum + (s as any).intensity * s.minutes;
      }, 0) / totalMinutes
    );
    expect(workout.avgIntensity).toBe(avgIntensity);
  });

  it("returns null when duration range leaves no room for core", async () => {
    vi.resetModules();
    vi.doMock("@/lib/generator", async () => {
      const actual = await vi.importActual<typeof import("@/lib/generator")>("@/lib/generator");
      return {
        ...actual,
        rangeToBounds: () => ({ min: 20, max: 20 }),
      };
    });
    const { generateWorkout } = await import("@/lib/generator");
    const res = generateWorkout({ ftp: 250, type: "tempo", durationRange: "30-45" });
    vi.resetModules();
    expect(res).toBeNull();
  });

  it("returns null when no variant fits", async () => {
    const { generateWorkout } = await import("@/lib/generator");
    const res = generateWorkout({ ftp: 250, type: "tempo", durationRange: "30-45" });
    expect(res).toBeNull();
  });
});
