// @vitest-environment jsdom
import WorkoutChart from "@/components/WorkoutChart";
import type { Step } from "@/lib/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("WorkoutChart", () => {
  it("renders steady rectangles and ramp trapezoids", () => {
    const steps: Step[] = [
      {
        kind: "steady",
        minutes: 5,
        intensity: 100,
        description: "steady",
        phase: "work",
      },
      {
        kind: "ramp",
        minutes: 5,
        from: 80,
        to: 120,
        description: "ramp",
        phase: "warmup",
      },
    ];
    render(<WorkoutChart steps={steps} ftp={200} />);
    const rect = screen.getByLabelText("5' • 100 W — steady");
    expect(rect.tagName.toLowerCase()).toBe("rect");
    const path = screen.getByLabelText("5' • ramp 80→120 W — ramp");
    expect(path.tagName.toLowerCase()).toBe("path");
  });

  it("clamps high intensity bars and applies zone 6 color", () => {
    const steps: Step[] = [
      {
        kind: "steady",
        minutes: 5,
        intensity: 260,
        description: "anaerobic",
        phase: "work",
      },
    ];
    render(<WorkoutChart steps={steps} ftp={200} />);
    const rect = screen.getByLabelText("5' • 260 W — anaerobic");
    const height = parseFloat(rect.getAttribute("height") || "0");
    expect(height).toBeCloseTo(81.25, 2);
    expect(rect.getAttribute("style")).toContain("var(--z6)");
  });

  it("keeps focus and pointer interactions in sync across bar shapes", async () => {
    const steps: Step[] = [
      {
        kind: "steady",
        minutes: 5,
        intensity: 100,
        description: "steady",
        phase: "work",
      },
      {
        kind: "ramp",
        minutes: 5,
        from: 80,
        to: 120,
        description: "ramp",
        phase: "warmup",
      },
    ];
    const { getAllByLabelText } = render(
      <WorkoutChart steps={steps} ftp={200} />
    );

    const cases = [
      getAllByLabelText("5' • 100 W — steady")[0],
      getAllByLabelText("5' • ramp 80→120 W — ramp")[0],
    ];

    for (const element of cases) {
      const ariaLabel = element.getAttribute("aria-label");
      expect(ariaLabel).not.toBeNull();
      const label = ariaLabel!;
      fireEvent.pointerDown(element, { pointerId: 1, pointerType: "mouse" });
      const tooltip = await screen.findByRole("tooltip");
      expect(tooltip.textContent).toBe(label);

      fireEvent.pointerLeave(element);
      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).toBeNull();
      });

      fireEvent.focus(element);
      const tooltipFromFocus = await screen.findByRole("tooltip");
      expect(tooltipFromFocus.textContent).toBe(label);

      fireEvent.blur(element);
      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).toBeNull();
      });
    }
  });
});
