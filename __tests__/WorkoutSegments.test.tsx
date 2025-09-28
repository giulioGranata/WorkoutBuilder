import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { WorkoutSegments } from "@/components/WorkoutSegments";

const makeSteps = () => [
  {
    kind: "ramp" as const,
    minutes: 8,
    from: 150,
    to: 200,
    phase: "warmup" as const,
    description: "Warm into it",
  },
  {
    kind: "steady" as const,
    minutes: 20,
    intensity: 225,
    phase: "work" as const,
    description: "Main set",
  },
  {
    kind: "ramp" as const,
    minutes: 6,
    from: 190,
    to: 120,
    phase: "cooldown" as const,
    description: "Spin down",
  },
];

describe("WorkoutSegments", () => {
  it("shows warm-up and cool-down ranges with ascending FTP percentages", () => {
    render(<WorkoutSegments steps={makeSteps()} ftp={250} />);

    expect(screen.getByText("Warm-up")).toBeTruthy();
    expect(screen.getByText("60–80% FTP")).toBeTruthy();

    expect(screen.getByText("Cool-down")).toBeTruthy();
    expect(screen.getByText("48–76% FTP")).toBeTruthy();
  });
});
