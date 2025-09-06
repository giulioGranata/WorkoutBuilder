// @vitest-environment jsdom
import type { Workout } from "@/lib/types";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkoutOutput } from "@/components/WorkoutOutput";

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
  signature: "sig",
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  toastMock.mockReset();
});

describe("Export actions", () => {
  it("renders three export buttons", () => {
    render(<WorkoutOutput workout={sampleWorkout} />);
    expect(screen.getByText("Export ZWO")).toBeTruthy();
    expect(screen.getByText("Export Text")).toBeTruthy();
    expect(screen.getByText("Export JSON")).toBeTruthy();
  });

  it("downloads JSON, Text, and ZWO with correct filenames and content", async () => {
    const blobSpy = vi.fn();
    class MockBlob {
      constructor(parts: any[], options: any) {
        blobSpy(parts, options);
      }
    }
    (globalThis as any).Blob = MockBlob as any;
    const createUrl = vi.fn(() => "blob:123");
    const revokeUrl = vi.fn();
    (globalThis as any).URL.createObjectURL = createUrl;
    (globalThis as any).URL.revokeObjectURL = revokeUrl;

    const clickedDownloads: string[] = [];
    const origClick = (HTMLAnchorElement.prototype as any).click;
    (HTMLAnchorElement.prototype as any).click = function () {
      clickedDownloads.push((this as HTMLAnchorElement).download);
    };

    render(<WorkoutOutput workout={sampleWorkout} />);

    // JSON
    fireEvent.click(screen.getByText("Export JSON"));
    expect(blobSpy).toHaveBeenCalled();
    const jsonParts = blobSpy.mock.calls[0][0] as any[];
    const jsonStr = String(jsonParts[0]);
    expect(jsonStr).toContain("\"biasPct\": 100");
    expect(clickedDownloads).toContain("Test_Workout_bias_100.json");

    // Text
    fireEvent.click(screen.getByText("Export Text"));
    const textParts = blobSpy.mock.calls.find((c: any[]) => c[1]?.type === "text/plain")[0] as any[];
    const textStr = String(textParts[0]);
    expect(textStr).toContain("FTP: 200 W");
    expect(textStr).toContain("Bias: 100%");
    expect(clickedDownloads).toContain("Test_Workout.txt");

    // ZWO
    fireEvent.click(screen.getByText("Export ZWO"));
    expect(clickedDownloads).toContain("Test_Workout.zwo");

    // restore
    (HTMLAnchorElement.prototype as any).click = origClick;
  });

  // Keyboard navigation via dropdown removed in new UX; buttons remain clickable

  it("does not show Copy Text button anymore", () => {
    render(<WorkoutOutput workout={sampleWorkout} />);
    expect(screen.queryByTestId("button-copy-text-full")).toBeNull();
  });
});
