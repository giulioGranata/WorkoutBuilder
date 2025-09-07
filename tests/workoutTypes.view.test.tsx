// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WorkoutTypes from "@/components/WorkoutTypes";

const LABELS = [
  "Very Easy",
  "Easy",
  "Moderate",
  "Hard",
  "Very Hard",
  "Maximal",
];

describe("WorkoutTypes", () => {
  it("renders difficulty badges with accent styles", () => {
    render(<WorkoutTypes />);
    LABELS.forEach((text) => {
      const badge = screen.getByText(text);
      expect(badge.className).toContain("bg-[--accent-solid]/20");
      expect(badge.className).toContain("text-[--accent-solid]");
    });
  });
});

