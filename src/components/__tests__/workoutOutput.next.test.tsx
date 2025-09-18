// @vitest-environment jsdom
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { WorkoutOutput } from "../WorkoutOutput";
import { generateWorkout } from "@/lib/generator";
import type { WorkoutFormData } from "@/lib/types";
import { renderWithPatternLibrary } from "../../../tests/testUtils";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("WorkoutOutput next workout", () => {
  afterEach(() => cleanup());

  it("hides Next Workout button when no workout", () => {
    renderWithPatternLibrary(<WorkoutOutput workout={null} attempted={false} />);
    expect(screen.queryByTestId("button-next-workout")).toBeNull();
  });

  it("cycles to a different workout on next click", () => {
    const params: WorkoutFormData = {
      ftp: 250,
      type: "tempo",
      durationRange: "45-60",
    };
    window.history.replaceState(
      {},
      "",
      `?ftp=${params.ftp}&durRange=${params.durationRange}&type=${params.type}`
    );
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const first = generateWorkout(params)!;
    renderWithPatternLibrary(<WorkoutOutput workout={first} attempted={true} />);
    const button = screen.getByTestId("button-next-workout");
    const titleBefore = screen.getByTestId("text-workout-title").textContent;
    fireEvent.click(button);
    const titleAfter = screen.getByTestId("text-workout-title").textContent;
    expect(titleAfter).not.toBe(titleBefore);
    spy.mockRestore();
  });

  it("hides Next Workout when only one variant fits", () => {
    const params: WorkoutFormData = {
      ftp: 250,
      type: "vo2max",
      durationRange: "30-45", // only one variant (C) fits this window
    };
    window.history.replaceState(
      {},
      "",
      `?ftp=${params.ftp}&durRange=${params.durationRange}&type=${params.type}`
    );

    const only = generateWorkout(params)!;
    renderWithPatternLibrary(<WorkoutOutput workout={only} attempted={true} />);
    expect(screen.queryByTestId("button-next-workout")).toBeNull();
  });
});
