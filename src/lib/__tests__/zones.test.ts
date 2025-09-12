import { describe, it, expect } from "vitest";
import { getZoneByPct, zoneColor, zoneLabel } from "../zones";

describe("zones utils", () => {
  it("maps percentages to zones at boundaries", () => {
    const cases: [number, string][] = [
      [59, "z1"],
      [60, "z2"],
      [75, "z2"],
      [76, "z3"],
      [90, "z3"],
      [91, "z4"],
      [105, "z4"],
      [106, "z5"],
      [120, "z5"],
      [121, "z6"],
    ];
    cases.forEach(([pct, zone]) => expect(getZoneByPct(pct)).toBe(zone));
  });

  it("provides color and label for a zone", () => {
    expect(zoneColor("z2")).toBe("var(--z2)");
    expect(zoneLabel("z3")).toBe("Tempo 76–90%");
  });
});
