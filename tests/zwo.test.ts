// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { toZwoXml } from "../src/lib/zwo";
import type { Workout } from "../src/lib/types";

const workout: Workout = {
  title: "Zwift Export <Test>",
  ftp: 250,
  steps: [
    {
      kind: "ramp",
      minutes: 5,
      from: 100,
      to: 150,
      description: "Warmup",
      phase: "warmup",
    }, // 0.40 -> 0.60
    {
      kind: "steady",
      minutes: 10,
      intensity: 300,
      description: "Work 1",
      phase: "work",
    }, // 1.20
    {
      kind: "steady",
      minutes: 5,
      intensity: 500,
      description: "Work 2",
      phase: "work",
    }, // 2.00 -> 1.60
    {
      kind: "ramp",
      minutes: 5,
      from: 50,
      to: 75,
      description: "Cooldown",
      phase: "cooldown",
    }, // 0.20 -> 0.30, 0.30
  ],
  totalMinutes: 25,
  workMinutes: 15,
  recoveryMinutes: 0,
  avgIntensity: 230,
  signature: "sig",
};

describe("toZwoXml", () => {
  it("emits well-formed XML with correct header and nodes", () => {
    const xml = toZwoXml({ ...workout, biasPct: 100, tss: 0 });
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<workout_file>');
    expect(xml).toContain('<author>Workout Generator 2.0</author>');
    expect(xml).toContain('<name>Zwift Export &amp;lt;Test&amp;gt;</name>'.replace(/&amp;lt;/g, '&lt;').replace(/&amp;gt;/g, '&gt;'));
    expect(xml).toContain('<description>FTP 250W • Bias 100% • TSS 0</description>');
  });

  it("creates one SteadyState per step with floored duration and clamped 2-decimal power", () => {
    const xml = toZwoXml({ ...workout, biasPct: 100, tss: 0 });

    // 4 steps -> 2 SteadyState + 2 Ramp
    const steadyMatches = xml.match(/<SteadyState\s/g) || [];
    const rampMatches = xml.match(/<Ramp\s/g) || [];
    expect(steadyMatches.length).toBe(2);
    expect(rampMatches.length).toBe(2);

    // Duration and power check
    expect(xml).toContain('Ramp Duration="300" PowerLow="0.40" PowerHigh="0.60"'); // warmup ramp
    expect(xml).toContain('SteadyState Duration="600" Power="1.20"'); // work 1
    expect(xml).toContain('SteadyState Duration="300" Power="1.60"'); // work 2 clamped
    expect(xml).toContain('Ramp Duration="300" PowerLow="0.30" PowerHigh="0.30"'); // cooldown ramp clamped

    // No NaN/undefined strings
    expect(xml.includes('NaN')).toBe(false);
    expect(xml.includes('undefined')).toBe(false);
  });

  it("is parseable via DOMParser (optional structural check)", () => {
    const xml = toZwoXml({ ...workout });
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const steadyNodes = doc.querySelectorAll("SteadyState");
    const rampNodes = doc.querySelectorAll("Ramp");
    expect(steadyNodes.length).toBe(2);
    expect(rampNodes.length).toBe(2);
    const firstRamp = rampNodes[0] as Element;
    expect(firstRamp.getAttribute("Duration")).toBe("300");
    expect(firstRamp.getAttribute("PowerLow")).toBe("0.40");
  });
});

