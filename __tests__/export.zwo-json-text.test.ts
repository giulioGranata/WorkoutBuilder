import { describe, it, expect } from "vitest";
import { toZwoXml } from "@/lib/zwo";
import { applyBias } from "@/lib/workoutSteps";
import { computeNP, computeTSS } from "@/lib/metrics";
import type { Workout, Step } from "@/lib/types";

const workout: Workout = {
  title: "Export Sample",
  ftp: 200,
  steps: [
    { kind: "steady", minutes: 5, intensity: 150, description: "steady", phase: "work" },
    { kind: "ramp", minutes: 5, from: 100, to: 140, description: "ramp", phase: "work" },
  ],
  totalMinutes: 10,
  workMinutes: 10,
  recoveryMinutes: 0,
  avgIntensity: 150,
  signature: "sig",
};

function buildJson(w: Workout, bias: number) {
  const steps: Step[] = w.steps.map((s) => {
    const kind = (s as any).kind ?? "steady";
    if (kind === "ramp") {
      const r = s as any;
      return { ...r, from: applyBias(r.from, bias), to: applyBias(r.to, bias), kind: "ramp" };
    }
    const st = s as any;
    return { ...st, intensity: applyBias(st.intensity, bias), kind: "steady" };
  });
  const avg = Math.round(
    steps.reduce((sum, s: any) => {
      if (s.kind === "ramp") {
        return sum + ((s.from + s.to) / 2) * s.minutes;
      }
      return sum + s.intensity * s.minutes;
    }, 0) / w.totalMinutes
  );
  const np = computeNP(steps as any, w.ftp);
  const tss = computeTSS(w.totalMinutes, np, w.ftp);
  const payload = { ...w, steps, avgIntensity: avg, biasPct: bias, tss };
  const header = `// ${w.title} • FTP: ${w.ftp} W • Bias: ${bias}% • TSS ${tss}\n`;
  return header + JSON.stringify(payload, null, 2);
}

function buildText(w: Workout, bias: number) {
  const steps = w.steps.map((s) => {
    const kind = (s as any).kind ?? "steady";
    if (kind === "ramp") {
      const r = s as any;
      return { ...r, from: applyBias(r.from, bias), to: applyBias(r.to, bias), kind: "ramp" };
    }
    const st = s as any;
    return { ...st, intensity: applyBias(st.intensity, bias), kind: "steady" };
  });
  const avg = Math.round(
    steps.reduce((sum, s: any) => {
      if (s.kind === "ramp") {
        return sum + ((s.from + s.to) / 2) * s.minutes;
      }
      return sum + s.intensity * s.minutes;
    }, 0) / w.totalMinutes
  );
  const np = computeNP(steps as any, w.ftp);
  const tss = computeTSS(w.totalMinutes, np, w.ftp);
  const header = `${w.title} • FTP: ${w.ftp} W • Bias: ${bias}% • TSS: ${tss}\n\n`;
  const body = steps
    .map((step, i) => {
      const kind = step.kind;
      const wattsText =
        kind === "ramp"
          ? `ramp ${(step as any).from}→${(step as any).to} W`
          : `${(step as any).intensity} W`;
      return `${i + 1}. ${step.minutes}' — ${wattsText} — ${step.description}`;
    })
    .join("\n");
  const footer = `\n\nTotal: ${w.totalMinutes}'\nAvg: ${avg} W\nTSS: ${tss}`;
  return header + body + footer;
}

describe("export formats", () => {
  it("produces consistent ZWO, JSON and Text outputs", () => {
    const bias = 110;
    const stepsBiased: Step[] = workout.steps.map((s: any) => {
      if ((s.kind ?? "steady") === "ramp") {
        return {
          ...s,
          from: applyBias(s.from, bias),
          to: applyBias(s.to, bias),
          kind: "ramp",
        };
      }
      return {
        ...s,
        intensity: applyBias(s.intensity, bias),
        kind: "steady",
      };
    });
    const np = computeNP(stepsBiased as any, workout.ftp);
    const tss = computeTSS(workout.totalMinutes, np, workout.ftp);
    const xml = toZwoXml({ ...workout, biasPct: bias, tss });
    const json = buildJson(workout, bias);
    const text = buildText(workout, bias);

    expect(xml).toMatchSnapshot("zwo");
    expect(json).toMatchSnapshot("json");
    expect(text).toMatchSnapshot("text");

    const jsonStr = json.replace(/^\/\/.*\n/, "");
    expect(() => JSON.parse(jsonStr)).not.toThrow();
  });
});
