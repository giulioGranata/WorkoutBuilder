// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WorkoutTypes from "@/components/WorkoutTypes";

const EXPECTED_COLORS: Record<string, string> = {
  "Very Easy": "var(--z1)",
  "Easy": "var(--z2)",
  "Moderate": "var(--z3)",
  "Hard": "var(--z4)",
  "Very Hard": "var(--z5)",
  "Maximal": "var(--z6)",
};

describe("WorkoutTypes", () => {
  it("renders difficulty badges with zone colors", () => {
    render(<WorkoutTypes />);
    Object.entries(EXPECTED_COLORS).forEach(([text, color]) => {
      const badge = screen.getByText(text);
      expect(badge).toBeTruthy();
      expect(badge.getAttribute("style")).toContain(color);
    });
  });
});

