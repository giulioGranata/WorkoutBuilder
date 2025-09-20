// @vitest-environment jsdom
import type { Workout } from "@/lib/types";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithPatternLibrary } from "../../../tests/testUtils";
import { WorkoutOutput } from "../WorkoutOutput";

declare const global: any;

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const baseWorkout: Workout = {
  title: "Predominant Zone",
  ftp: 200,
  steps: [
    {
      minutes: 20,
      intensity: Math.round(200 * 0.7),
      phase: "work",
      description: "z2",
    },
    {
      minutes: 10,
      intensity: Math.round(200 * 0.85),
      phase: "work",
      description: "z3",
    },
  ],
  totalMinutes: 30,
  workMinutes: 30,
  recoveryMinutes: 0,
  avgIntensity: 0,
  signature: "sig",
};

describe("WorkoutOutput main set zone", () => {
  afterEach(() => cleanup());
  it("shows predominant zone without bias", () => {
    renderWithPatternLibrary(<WorkoutOutput workout={baseWorkout} />);
    expect(screen.getByText("Endurance 60–75%"));
    const dot = screen
      .getByText("Main Set")
      .closest("li")!
      .querySelector("span.w-2")!;
    expect(dot.getAttribute("style")).toContain("var(--z2)");
  });

  it("updates predominant zone with bias", () => {
    renderWithPatternLibrary(<WorkoutOutput workout={baseWorkout} />);
    const range = screen.getAllByTestId("bias-range")[0];
    fireEvent.change(range, { target: { value: 115 } });
    expect(screen.getByText("Tempo 76–90%"));
    const dot = screen
      .getByText("Main Set")
      .closest("li")!
      .querySelector("span.w-2")!;
    expect(dot.getAttribute("style")).toContain("var(--z3)");
  });

  it("shows integer TSS and exports JSON with tss field", async () => {
    const createUrl = vi.fn((_b: any) => "blob:123");
    const revokeUrl = vi.fn();
    global.URL.createObjectURL = createUrl;
    global.URL.revokeObjectURL = revokeUrl;
    class MockBlob {
      parts: any[];
      constructor(parts: any[]) {
        this.parts = parts;
      }
      text() {
        return Promise.resolve(String(this.parts[0]));
      }
    }
    global.Blob = MockBlob as any;
    const origClick = (HTMLAnchorElement.prototype as any).click;
    (HTMLAnchorElement.prototype as any).click = vi.fn();

    renderWithPatternLibrary(<WorkoutOutput workout={baseWorkout} />);
    const tssVal = screen.getByTestId("text-tss").textContent || "";
    expect(tssVal).toMatch(/^\d+$/);

    fireEvent.click(screen.getByText("Export JSON"));
    const blob = createUrl.mock.calls[0]![0] as any;
    const jsonStr = await (blob as any).text();
    expect(jsonStr).toContain('"tss"');

    (HTMLAnchorElement.prototype as any).click = origClick;
  });
});
