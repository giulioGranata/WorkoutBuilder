// @vitest-environment jsdom
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Workout } from "@/lib/types";
import { WorkoutOutput } from "@/components/WorkoutOutput";

describe("WorkoutOutput main set zone", () => {
  const workout: Workout = {
    title: "Test", // simple workout
    ftp: 200,
    totalMinutes: 10,
    steps: [
      { minutes: 10, intensity: 140, phase: "work", description: "steady" },
    ],
    signature: "x",
  } as any;

  it("updates main set zone when bias changes", () => {
    render(<WorkoutOutput workout={workout} attempted />);
    const row = screen.getByText("Main Set").closest("li")!;
    expect(within(row).getByText("Endurance 65–75%"));
    const dot = row.querySelector("span[style]") as HTMLElement;
    expect(dot.style.backgroundColor).toBe("var(--z2)");

    const slider = screen.getByLabelText("Bias percentage");
    fireEvent.change(slider, { target: { value: 110 } });

    const rowAfter = screen.getByText("Main Set").closest("li")!;
    expect(within(rowAfter).getByText("Tempo 76–90%"));
    const dotAfter = rowAfter.querySelector("span[style]") as HTMLElement;
    expect(dotAfter.style.backgroundColor).toBe("var(--z3)");
  });
});

