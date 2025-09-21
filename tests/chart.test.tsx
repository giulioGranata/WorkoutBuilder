// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("clamps high intensity bars and applies zone 6 color", () => {
    const steps: Step[] = [
      { kind: "steady", minutes: 5, intensity: 260, description: "anaerobic", phase: "work" },
    ];
    render(<WorkoutChart steps={steps} ftp={200} />);
    const rect = screen.getByLabelText("5' • 260 W — anaerobic");
    const height = parseFloat(rect.getAttribute("height") || "0");
    expect(height).toBeCloseTo(81.25, 2);
    expect(rect.getAttribute("style")).toContain("var(--z6)");
  });

  it("keeps focus and pointer interactions in sync across bar shapes", async () => {
    const steps: Step[] = [
      { kind: "steady", minutes: 5, intensity: 100, description: "steady", phase: "work" },
      { kind: "ramp", minutes: 5, from: 80, to: 120, description: "ramp", phase: "warmup" },
    ];
    const { getAllByLabelText, getByText, queryByText } = render(
      <WorkoutChart steps={steps} ftp={200} />
    );

    const cases = [
      {
        element: getAllByLabelText("5' • 100 W — steady")[0],
        title: "5' • 100 W",
        description: "steady",
      },
      {
        element: getAllByLabelText("5' • ramp 80→120 W — ramp")[0],
        title: "5' • ramp 80→120 W",
        description: "ramp",
      },
    ];

    for (const { element, title, description } of cases) {
      fireEvent.pointerDown(element, { pointerId: 1, pointerType: "mouse" });
      expect(getByText(title)).toBeDefined();
      expect(getByText(description)).toBeDefined();

      fireEvent.pointerLeave(element);
      await waitFor(() => {
        expect(queryByText(title)).toBeNull();
      });

      fireEvent.focus(element);
      expect(getByText(title)).toBeDefined();
      expect(getByText(description)).toBeDefined();

      fireEvent.blur(element);
      await waitFor(() => {
        expect(queryByText(title)).toBeNull();
      });
    }
  });
});
