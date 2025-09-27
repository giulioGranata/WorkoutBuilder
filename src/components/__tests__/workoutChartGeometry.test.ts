import { describe, expect, it } from "vitest";
import type { Step } from "@/lib/types";
import {
  computeWorkoutGeometry,
  roundedTrapezoidPath,
} from "../workoutChartGeometry";

describe("workoutChartGeometry", () => {
  it("builds ramp trapezoid path with rounded corners", () => {
    const path = roundedTrapezoidPath(10, 30, 100, 60, 40, 2);
    expect(path).toMatchInlineSnapshot(`"M 12 100 L 28 100 Q 30 100 30 98 L 30 42 Q 30 40 28.585786437626904 41.41421356237309 L 11.414213562373096 58.58578643762691 Q 10 60 10 62 L 10 98 Q 10 100 12 100 Z"`);
  });

  it("produces stable bar layout for mixed steps", () => {
    const steps: Step[] = [
      {
        kind: "steady",
        minutes: 5,
        intensity: 120,
        phase: "warmup",
        description: "Easy spin",
      },
      {
        kind: "ramp",
        minutes: 10,
        from: 150,
        to: 200,
        phase: "work",
        description: "Build to FTP",
      },
      {
        kind: "steady",
        minutes: 5,
        intensity: 130,
        phase: "cooldown",
        description: "Coast down",
      },
    ];

    const geometry = computeWorkoutGeometry(steps, 200);
    expect(geometry).toMatchInlineSnapshot(`
      {
        "bars": [
          {
            "h": 37.49999999999999,
            "s": {
              "description": "Easy spin",
              "intensity": 120,
              "kind": "steady",
              "minutes": 5,
              "phase": "warmup",
            },
            "shape": "rect",
            "topY": 62.50000000000001,
            "w": 24.7,
            "x": 0,
            "y": 62.50000000000001,
            "yEnd": 62.50000000000001,
            "yStart": 62.50000000000001,
          },
          {
            "h": 62.5,
            "s": {
              "description": "Build to FTP",
              "from": 150,
              "kind": "ramp",
              "minutes": 10,
              "phase": "work",
              "to": 200,
            },
            "shape": "trapezoid",
            "topY": 37.5,
            "w": 49.4,
            "x": 25.3,
            "y": 37.5,
            "yEnd": 37.5,
            "yStart": 53.125,
          },
          {
            "h": 40.625,
            "s": {
              "description": "Coast down",
              "intensity": 130,
              "kind": "steady",
              "minutes": 5,
              "phase": "cooldown",
            },
            "shape": "rect",
            "topY": 59.375,
            "w": 24.7,
            "x": 75.3,
            "y": 59.375,
            "yEnd": 59.375,
            "yStart": 59.375,
          },
        ],
        "totalMinutes": 20,
      }
    `);
  });
});
