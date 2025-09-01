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
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  toastMock.mockReset();
});

describe("Export dropdown", () => {
  it("renders Export button and opens menu", () => {
    render(<WorkoutOutput workout={sampleWorkout} />);
    const btn = screen.getByTestId("button-export-dropdown");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-haspopup", "menu");
    fireEvent.click(btn);
    expect(screen.getByTestId("menu-export-json")).toBeInTheDocument();
    expect(screen.getByTestId("menu-export-text")).toBeInTheDocument();
    expect(screen.getByTestId("menu-export-zwo")).toBeInTheDocument();
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
    fireEvent.click(screen.getByTestId("button-export-dropdown"));
    fireEvent.click(screen.getByTestId("menu-export-json"));
    expect(blobSpy).toHaveBeenCalled();
    const jsonParts = blobSpy.mock.calls[0][0] as any[];
    const jsonStr = String(jsonParts[0]);
    expect(jsonStr).toContain("\"biasPct\": 100");
    expect(clickedDownloads).toContain("Test_Workout_bias_100.json");

    // Text
    fireEvent.click(screen.getByTestId("button-export-dropdown"));
    fireEvent.click(screen.getByTestId("menu-export-text"));
    const textParts = blobSpy.mock.calls.find((c: any[]) => c[1]?.type === "text/plain")[0] as any[];
    const textStr = String(textParts[0]);
    expect(textStr).toContain("FTP: 200 W");
    expect(textStr).toContain("Bias: 100%");
    expect(clickedDownloads).toContain("Test_Workout.txt");

    // ZWO
    fireEvent.click(screen.getByTestId("button-export-dropdown"));
    fireEvent.click(screen.getByTestId("menu-export-zwo"));
    expect(clickedDownloads).toContain("Test_Workout.zwo");

    // restore
    (HTMLAnchorElement.prototype as any).click = origClick;
  });

  it("supports keyboard navigation", async () => {
    render(<WorkoutOutput workout={sampleWorkout} />);
    const btn = screen.getByTestId("button-export-dropdown");
    btn.focus();
    await act(async () => {
      fireEvent.keyDown(btn, { key: "Enter" });
    });
    const jsonItem = screen.getByTestId("menu-export-json");
    // Arrow down and press Enter should select
    jsonItem.focus();
    await act(async () => {
      fireEvent.keyDown(jsonItem, { key: "ArrowDown" });
      fireEvent.keyDown(jsonItem, { key: "Enter" });
    });
  });

  it("does not show Copy Text button anymore", () => {
    render(<WorkoutOutput workout={sampleWorkout} />);
    expect(screen.queryByTestId("button-copy-text-full")).toBeNull();
  });
});

