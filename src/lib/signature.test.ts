import { describe, it, expect } from "vitest";
import { getSignature } from "./signature";
import type { Workout } from "./types";

describe("getSignature", () => {
  it("includes ramp and steady steps", () => {
    const workout: Workout = {
      title: "Sig",
      ftp: 200,
      steps: [
        {
          kind: "ramp",
          minutes: 5,
          from: 100,
          to: 120,
          description: "WU",
          phase: "warmup",
        },
        {
          kind: "steady",
          minutes: 10,
          intensity: 150,
          description: "Work",
          phase: "work",
        },
      ],
      totalMinutes: 15,
      workMinutes: 10,
      recoveryMinutes: 0,
      avgIntensity: 130,
    };
    expect(getSignature(workout)).toBe("r:5:100:120:warmup|s:10:150:work");
  });
});
