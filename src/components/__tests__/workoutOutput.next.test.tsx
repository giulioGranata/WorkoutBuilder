// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { WorkoutOutput } from "../WorkoutOutput";
import { generateWorkout } from "@/lib/generator";
import type { WorkoutFormData } from "@/lib/types";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("WorkoutOutput next workout", () => {
  afterEach(() => cleanup());

  it("hides Next Workout button when no workout", () => {
    render(<WorkoutOutput workout={null} attempted={false} />);
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
    render(<WorkoutOutput workout={first} attempted={true} />);
    const button = screen.getByTestId("button-next-workout");
    const titleBefore = screen.getByTestId("text-workout-title").textContent;
    fireEvent.click(button);
    const titleAfter = screen.getByTestId("text-workout-title").textContent;
    expect(titleAfter).not.toBe(titleBefore);
    spy.mockRestore();
  });
});
