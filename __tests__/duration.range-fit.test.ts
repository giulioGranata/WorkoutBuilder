import { describe, it, expect } from "vitest";
import { generateWorkout, rangeToBounds } from "@/lib/generator";

const FTP = 200;

const cases: Array<[
  Parameters<typeof generateWorkout>[0],
  boolean
]> = [
  [{ ftp: FTP, type: "recovery", durationRange: "30-45" }, true],
  [{ ftp: FTP, type: "vo2max", durationRange: "45-60" }, true],
  [{ ftp: FTP, type: "tempo", durationRange: "60-75" }, true],
  [{ ftp: FTP, type: "threshold", durationRange: "75-90" }, false],
  [{ ftp: FTP, type: "endurance", durationRange: "90-plus" }, false],
];

describe("duration ranges", () => {
  for (const [args, shouldExist] of cases) {
    it(`${args.type} ${args.durationRange}`, () => {
      const res = generateWorkout(args);
      if (!shouldExist) {
        expect(res).toBeNull();
      } else {
        expect(res).not.toBeNull();
        const w = res!;
        const bounds = rangeToBounds(args.durationRange);
        expect(w.totalMinutes).toBeGreaterThanOrEqual(bounds.min);
        if (typeof bounds.max === "number") {
          expect(w.totalMinutes).toBeLessThanOrEqual(bounds.max);
        }
      }
    });
  }
});
