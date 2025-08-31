// @vitest-environment jsdom
import type { Workout } from "@/lib/types";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkoutOutput } from "./WorkoutOutput";

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const sampleWorkout: Workout = {
  title: "Test Workout",
  ftp: 200,
  steps: [
    { minutes: 5, intensity: 120, description: "Warmup", phase: "warmup" },
    { minutes: 5, intensity: 150, description: "Work", phase: "work" },
    { minutes: 5, intensity: 100, description: "Cooldown", phase: "cooldown" },
  ],
  totalMinutes: 15,
  workMinutes: 5,
  recoveryMinutes: 0,
  avgIntensity: 120,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  toastMock.mockReset();
});

describe("WorkoutOutput export & clipboard", () => {
  it("exports workout JSON with bias and shows toast", () => {
    const blobSpy = vi.fn();
    class MockBlob {
      constructor(parts: any[], options: any) {
        blobSpy(parts, options);
      }
    }
    (globalThis as any).Blob = MockBlob as any;
    (globalThis as any).URL.createObjectURL = vi.fn(() => "blob:123");
    (globalThis as any).URL.revokeObjectURL = vi.fn();

    render(<WorkoutOutput workout={sampleWorkout} />);

    fireEvent.click(screen.getByTestId("button-export-json-full"));

    expect(blobSpy).toHaveBeenCalled();
    const data = blobSpy.mock.calls[0][0][0] as string;
    expect(data).toContain('"biasPct": 100');
    expect(toastMock).toHaveBeenCalledWith({
      title: "Export successful",
      description: "Workout exported as JSON (with bias).",
    });
  });

  it("copies workout text and handles failure", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    (navigator as any).clipboard = { writeText };

    render(<WorkoutOutput workout={sampleWorkout} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("button-copy-text-full"));
    });
    expect(writeText).toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith({
      title: "Copied to clipboard",
      description: "Workout details copied (with bias).",
    });

    toastMock.mockReset();
    writeText.mockRejectedValueOnce(new Error("fail"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("button-copy-text-full"));
    });
    expect(toastMock).toHaveBeenCalledWith({
      title: "Copy failed",
      description: "Failed to copy to clipboard",
      variant: "destructive",
    });
  });
});
