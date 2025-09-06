// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WorkoutChart } from "./WorkoutChart";
import type { Step } from "@/lib/types";

describe("WorkoutChart", () => {
  it("draws polygons for ramps and rectangles for steady steps", () => {
    const steps: Step[] = [
      {
        kind: "ramp",
        minutes: 5,
        from: 100,
        to: 200,
        phase: "warmup",
        description: "WU",
      },
      {
        kind: "steady",
        minutes: 10,
        intensity: 150,
        phase: "work",
        description: "Work",
      },
    ];
    render(<WorkoutChart steps={steps} ftp={200} biasPct={110} />);
    const ramp = screen.getByTestId("step-0");
    const steady = screen.getByTestId("step-1");
    expect(ramp.tagName.toLowerCase()).toBe("polygon");
    expect(steady.tagName.toLowerCase()).toBe("rect");
    expect(ramp.getAttribute("points")).toBe("0,400 0,290 50,180 50,400");
    expect(steady.getAttribute("x")).toBe("50");
    expect(steady.getAttribute("y")).toBe("235");
    expect(steady.getAttribute("height")).toBe("165");
  });
});
