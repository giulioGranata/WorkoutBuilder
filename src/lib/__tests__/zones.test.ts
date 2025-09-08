import { describe, it, expect } from "vitest";
import { getZoneByPct, getZoneColor, getZoneLabel } from "../zones";

describe("zones utils", () => {
  it("maps percentages to zones, colors and labels", () => {
    expect(getZoneByPct(68)).toBe("z2");
    expect(getZoneColor("z2")).toBe("var(--z2)");
    expect(getZoneLabel(68)).toBe("Endurance 65–75%");

    expect(getZoneByPct(88)).toBe("z3");
    expect(getZoneColor("z3")).toBe("var(--z3)");
    expect(getZoneLabel(88)).toBe("Tempo 76–90%");

    expect(getZoneByPct(100)).toBe("z4");
    expect(getZoneColor("z4")).toBe("var(--z4)");
    expect(getZoneLabel(100)).toBe("Threshold 95–105%");

    expect(getZoneByPct(118)).toBe("z5");
    expect(getZoneColor("z5")).toBe("var(--z5)");
    expect(getZoneLabel(118)).toBe("VO2max 110–120%");

    expect(getZoneByPct(130)).toBe("z6");
    expect(getZoneColor("z6")).toBe("var(--z6)");
    expect(getZoneLabel(130)).toBe("Anaerobic 125–150%");
  });
});

