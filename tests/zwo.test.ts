// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { toZwoXml } from "../src/lib/zwo";
import type { Workout } from "../src/lib/types";

const workout: Workout = {
  title: "Zwift Export <Test>",
  ftp: 250,
  steps: [
    { minutes: 5, intensity: 100, description: "Warmup", phase: "warmup" }, // 100/250=0.40
    { minutes: 10, intensity: 300, description: "Work 1", phase: "work" }, // 300/250=1.20
    { minutes: 5, intensity: 500, description: "Work 2", phase: "work" }, // 500/250=2.00 -> 1.60 (clamp)
    { minutes: 5, intensity: 50, description: "Cooldown", phase: "cooldown" }, // 50/250=0.20 -> 0.30 (clamp)
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

  it("creates one SteadyState per step with floored duration and clamped 2-decimal power", () => {
    const xml = toZwoXml({ ...workout, biasPct: 100 });

    // 4 steps -> 4 blocks
    const matches = xml.match(/<SteadyState\s/g) || [];
    expect(matches.length).toBe(workout.steps.length);

    // Duration check (floor(minutes*60))
    expect(xml).toContain('Duration="300" Power="0.40"'); // 5' warmup
    expect(xml).toContain('Duration="600" Power="1.20"'); // 10' work 1
    expect(xml).toContain('Duration="300" Power="1.60"'); // 5' work 2 clamped down from 2.00
    expect(xml).toContain('Duration="300" Power="0.30"'); // 5' cooldown clamped up from 0.20

    // No NaN/undefined strings
    expect(xml.includes('NaN')).toBe(false);
    expect(xml.includes('undefined')).toBe(false);
  });

  it("is parseable via DOMParser (optional structural check)", () => {
    const xml = toZwoXml({ ...workout });
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const nodes = doc.querySelectorAll('SteadyState');
    expect(nodes.length).toBe(workout.steps.length);
    const first = nodes[0] as Element;
    expect(first.getAttribute('Duration')).toBe('300');
    expect(first.getAttribute('Power')).toBe('0.40');
  });
});

