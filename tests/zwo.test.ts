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
    }, // 100→150
    {
      kind: "steady",
      minutes: 10,
      intensity: 300,
      description: "Work 1",
      phase: "work",
    }, // 300/250=1.20
    {
      kind: "steady",
      minutes: 5,
      intensity: 500,
      description: "Work 2",
      phase: "work",
    }, // 500/250=2.00 -> 1.60 (clamp)
    {
      kind: "ramp",
      minutes: 5,
      from: 150,
      to: 100,
      description: "Cooldown",
      phase: "cooldown",
    }, // 150→100
  ],
  totalMinutes: 25,
  workMinutes: 15,
  recoveryMinutes: 0,
  avgIntensity: 230,
};

describe("toZwoXml", () => {
  it("emits well-formed XML with correct header and nodes", () => {
    const xml = toZwoXml({ ...workout, biasPct: 100 });
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<workout_file>');
    expect(xml).toContain('<author>Workout Generator 2.0</author>');
    expect(xml).toContain('<name>Zwift Export &amp;lt;Test&amp;gt;</name>'.replace(/&amp;lt;/g, '&lt;').replace(/&amp;gt;/g, '&gt;'));
    expect(xml).toContain('<description>FTP 250W • Bias 100%</description>');
  });

  it("creates proper blocks with floored duration and clamped 2-decimal power", () => {
    const xml = toZwoXml({ ...workout, biasPct: 100 });

    // 4 steps -> 4 blocks (2 Ramp + 2 SteadyState)
    const steady = xml.match(/<SteadyState\s/g) || [];
    const ramps = xml.match(/<Ramp\s/g) || [];
    expect(steady.length + ramps.length).toBe(workout.steps.length);

    // Duration and power checks
    expect(xml).toContain('Duration="300" PowerLow="0.40" PowerHigh="0.60"'); // warmup ramp
    expect(xml).toContain('Duration="600" Power="1.20"'); // work 1
    expect(xml).toContain('Duration="300" Power="1.60"'); // work 2 clamped
    expect(xml).toContain('Duration="300" PowerLow="0.60" PowerHigh="0.40"'); // cooldown ramp

    // No NaN/undefined strings
    expect(xml.includes('NaN')).toBe(false);
    expect(xml.includes('undefined')).toBe(false);
  });

  it("is parseable via DOMParser (optional structural check)", () => {
    const xml = toZwoXml({ ...workout });
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const nodes = doc.querySelectorAll('SteadyState, Ramp');
    expect(nodes.length).toBe(workout.steps.length);
    const first = nodes[0] as Element;
    expect(first.getAttribute('Duration')).toBe('300');
    expect(first.tagName).toBe('Ramp');
  });
});

