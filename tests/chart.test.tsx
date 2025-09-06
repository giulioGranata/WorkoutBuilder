// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WorkoutChart from "@/components/WorkoutChart";
import type { Step } from "@/lib/types";

describe("WorkoutChart", () => {
  it("renders steady rectangles and ramp trapezoids", () => {
    const steps: Step[] = [
      { kind: "steady", minutes: 5, intensity: 100, description: "steady", phase: "work" },
      { kind: "ramp", minutes: 5, from: 80, to: 120, description: "ramp", phase: "warmup" },
    ];
    render(<WorkoutChart steps={steps} ftp={200} />);
    const rect = screen.getByLabelText("5' • 100 W — steady");
    expect(rect.tagName.toLowerCase()).toBe("rect");
    const path = screen.getByLabelText("5' • ramp 80→120 W — ramp");
    expect(path.tagName.toLowerCase()).toBe("path");
  });
});
