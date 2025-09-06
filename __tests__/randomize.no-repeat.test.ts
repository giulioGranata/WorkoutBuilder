import { describe, expect, it, vi } from "vitest";
import { generateWorkout } from "@/lib/generator";

describe("generateWorkout randomization", () => {
  it("returns same workout when only one variant fits", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const first = generateWorkout({
      ftp: 250,
      type: "tempo",
      durationRange: "60-75",
    });
    expect(first).not.toBeNull();
    const second = generateWorkout(
      { ftp: 250, type: "tempo", durationRange: "60-75" },
      first!.signature
    );
    expect(second).not.toBeNull();
    expect(second!.signature).toBe(first!.signature);
    spy.mockRestore();
  });

  it("avoids immediate repeat when two variants fit", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const first = generateWorkout({
      ftp: 250,
      type: "tempo",
      durationRange: "45-60",
    });
    expect(first).not.toBeNull();
    const second = generateWorkout(
      { ftp: 250, type: "tempo", durationRange: "45-60" },
      first!.signature
    );
    expect(second).not.toBeNull();
    expect(second!.signature).not.toBe(first!.signature);
    spy.mockRestore();
  });

  it("rotates through multiple variants without immediate repetition", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const one = generateWorkout({
      ftp: 250,
      type: "recovery",
      durationRange: "30-45",
    });
    const two = generateWorkout(
      { ftp: 250, type: "recovery", durationRange: "30-45" },
      one!.signature
    );
    const three = generateWorkout(
      { ftp: 250, type: "recovery", durationRange: "30-45" },
      two!.signature
    );
    expect(one).not.toBeNull();
    expect(two).not.toBeNull();
    expect(three).not.toBeNull();
    expect(two!.signature).not.toBe(one!.signature);
    expect(three!.signature).not.toBe(two!.signature);
    expect(three!.signature).toBe(one!.signature);
    spy.mockRestore();
  });
});

