// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { WorkoutForm } from "@/components/WorkoutForm";

const mockGenerate = vi.fn(() => null);
vi.mock("@/lib/generator", () => ({
  generateWorkout: (...args: any[]) => mockGenerate(...args),
}));

describe("WorkoutForm URL durRange parsing", () => {
  beforeEach(() => {
    mockGenerate.mockReset();
  });

  it("parses ?durRange=60-75 and sets select", async () => {
    const orig = window.location.href;
    window.history.replaceState({}, "", "http://localhost/?durRange=60-75");

    render(<WorkoutForm onWorkoutGenerated={() => {}} />);

    // Submit the form and verify generateWorkout receives 60-75
    const btn = screen.getByTestId("button-generate");
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(mockGenerate).toHaveBeenCalled();
    const arg = mockGenerate.mock.calls[0][0];
    expect(arg.durationRange).toBe("60-75");

    window.history.replaceState({}, "", orig);
  });

  it("ignores legacy ?dur=60 without errors", async () => {
    const orig = window.location.href;
    window.history.replaceState({}, "", "http://localhost/?dur=60");

    render(<WorkoutForm onWorkoutGenerated={() => {}} />);
    const btn = screen.getByTestId("button-generate");
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(mockGenerate).toHaveBeenCalled();
    const arg = mockGenerate.mock.calls[0][0];
    // Default is 60-75 per spec
    expect(arg.durationRange).toBe("60-75");

    window.history.replaceState({}, "", orig);
  });
});

