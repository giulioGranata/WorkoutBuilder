// Quick export coherence check (JSON/TXT/ZWO) with bias/ramp/zone validation.
// - Generates workouts for multiple types/ranges
// - Applies bias consistently (same logic as UI)
// - Computes predominant zone via official util
// - Builds JSON/TXT/ZWO exports and validates structure and values
// - Prints a concise table and exits non-zero on failure

import { generateWorkout } from "../src/lib/generator.ts";
import { toZwoXml } from "../src/lib/zwo.ts";
import type {
  DurationRangeValue,
  Step,
  Workout,
  WorkoutType,
} from "../src/lib/types.ts";
import {
  applyBias,
  computeNP,
  computeTSS,
  getPredominantZone,
} from "../src/lib/smokeUtils.ts";
import { XMLParser } from "fast-xml-parser";

const FTP = 250;
const TYPES: WorkoutType[] = [
  "recovery",
  "endurance",
  "tempo",
  "threshold",
  "vo2max",
  "anaerobic",
];
const RANGES: DurationRangeValue[] = ["30-45", "45-60", "60-75"];
const BIASES = [75, 100, 125];

type Row = {
  type: WorkoutType;
  range: DurationRangeValue;
  bias: number;
  total: number;
  avgW: number;
  predominantZone: string;
  zwoOk: boolean;
};

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

// Normalize description exactly like the UI
const normalizeDescription = (text: string) => text.replace(/truncated/gi, "shortened");

// Apply bias to steps exactly like the UI view (minutes preserved)
function buildBiasedSteps(steps: Step[], bias: number): Step[] {
  return steps.map((s) => {
    const kind = (s as any).kind ?? "steady";
    if (kind === "ramp") {
      const r = s as any;
      return {
        ...r,
        kind: "ramp",
        from: applyBias(r.from, bias),
        to: applyBias(r.to, bias),
      } as Step;
    }
    const ss = s as any;
    return {
      ...ss,
      kind: "steady",
      intensity: applyBias(ss.intensity, bias),
    } as Step;
  });
}

function computeBiasedAvgIntensity(steps: Step[], totalMinutes: number): number {
  if (!steps.length || totalMinutes <= 0) return 0;
  const weighted =
    steps.reduce((sum, s: any) => {
      return (
        sum +
        (s.kind === "ramp"
          ? ((s.from + s.to) / 2) * s.minutes
          : s.intensity * s.minutes)
      );
    }, 0) / totalMinutes;
  return Math.round(weighted);
}

function buildTextExport(
  workout: Workout,
  steps: Step[],
  bias: number,
  avgW: number,
  tss: number
): { text: string; lineCount: number } {
  const header = `${workout.title} • FTP: ${workout.ftp} W • Bias: ${bias}% • TSS: ${tss}\n\n`;
  const bodyLines = steps.map((step, i) => {
    const kind = (step as any).kind ?? "steady";
    const wattsText =
      kind === "ramp"
        ? `ramp ${(step as any).from}→${(step as any).to} W`
        : `${(step as any).intensity} W`;
    return `${i + 1}. ${step.minutes}' — ${wattsText} — ${normalizeDescription(
      (step as any).description
    )}`;
  });
  const footer = `\n\nTotal: ${workout.totalMinutes}'\nAvg: ${avgW} W\nTSS: ${tss}`;
  return { text: header + bodyLines.join("\n") + footer, lineCount: bodyLines.length };
}

function parseAndValidateZwo(xml: string, expectedSteps: Step[]): boolean {
  try {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const obj = parser.parse(xml);
    if (!obj || typeof obj !== "object" || !obj.workout_file) return false;
    const wf = obj.workout_file;
    if (!wf.workout) return false;
    const wk = wf.workout;

    // Collect step nodes from current mapping (Ramp and SteadyState)
    const collect = (key: string) =>
      wk[key]
        ? Array.isArray(wk[key])
          ? (wk[key] as any[])
          : [wk[key]]
        : [];
    const ramps = collect("Ramp");
    const steadies = collect("SteadyState");
    const nodes = ramps.map((n) => ({ kind: "ramp", n })).concat(steadies.map((n) => ({ kind: "steady", n })));

    if (nodes.length !== expectedSteps.length) return false;

    // Per-node validations
    for (let i = 0; i < nodes.length; i++) {
      const { kind, n } = nodes[i] as { kind: "ramp" | "steady"; n: any };
      const dur = parseInt(n["@_Duration"], 10);
      if (!Number.isFinite(dur) || dur <= 0) return false;
      if (kind === "ramp") {
        const low = parseFloat(n["@_PowerLow"]);
        const high = parseFloat(n["@_PowerHigh"]);
        if (!Number.isFinite(low) || !Number.isFinite(high)) return false;
        if (low < 0 || high < 0 || low > 2.5 || high > 2.5) return false;
      } else {
        const p = parseFloat(n["@_Power"]);
        if (!Number.isFinite(p)) return false;
        if (p < 0 || p > 2.5) return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const rows: Row[] = [];
  const byKey: Record<string, number[]> = {}; // key = `${type}|${range}` → [avgW75, avgW100, avgW125]

  for (const type of TYPES) {
    for (const range of RANGES) {
      const workout = generateWorkout({ ftp: FTP, durationRange: range, type });
      if (!workout) {
        console.warn(`[${type} ${range}] skipped (no workout generated)`);
        continue;
      }

      for (const bias of BIASES) {
        const biasedSteps = buildBiasedSteps(workout.steps, bias);

        // Sanity validations on steps
        for (const st of biasedSteps) {
          if (st.minutes <= 0) fail(`[${type} ${range} @${bias}] minutes <= 0`);
          const kind = (st as any).kind ?? "steady";
          if (kind === "ramp") {
            const { from, to } = st as any;
            if (from < 0 || to < 0) fail(`[${type} ${range} @${bias}] ramp watts < 0`);
          } else {
            const { intensity } = st as any;
            if (intensity < 0) fail(`[${type} ${range} @${bias}] intensity < 0`);
          }
        }

        // Metrics
        const avgW = computeBiasedAvgIntensity(biasedSteps, workout.totalMinutes);
        const np = computeNP(biasedSteps as any, FTP);
        const tss = computeTSS(workout.totalMinutes, np, FTP);
        if (!Number.isFinite(avgW) || avgW <= 0) fail(`[${type} ${range} @${bias}] avgIntensity invalid`);
        if (!Number.isFinite(np) || !Number.isFinite(tss)) fail(`[${type} ${range} @${bias}] NP/TSS invalid`);

        // Predominant zone
        const zone = getPredominantZone(biasedSteps, FTP);
        if (!zone || !/^z[1-6]$/.test(zone)) fail(`[${type} ${range} @${bias}] predominant zone invalid`);

        // JSON payload (same shape as app export)
        const jsonPayload = {
          ...workout,
          steps: biasedSteps.map((s: any) => ({ ...s, description: normalizeDescription(s.description) })),
          avgIntensity: avgW,
          biasPct: bias,
          tss,
        };
        const parsed = JSON.parse(JSON.stringify(jsonPayload));
        if (
          !parsed.title ||
          !Array.isArray(parsed.steps) ||
          typeof parsed.totalMinutes !== "number" ||
          typeof parsed.avgIntensity !== "number" ||
          typeof parsed.biasPct !== "number"
        ) {
          fail(`[${type} ${range} @${bias}] JSON missing required fields`);
        }

        // TXT formatting (same as UI)
        const { text, lineCount } = buildTextExport(workout, biasedSteps, bias, avgW, tss);
        if (!text.trim()) fail(`[${type} ${range} @${bias}] TXT is empty`);
        if (lineCount !== biasedSteps.length)
          fail(`[${type} ${range} @${bias}] TXT steps mismatch (${lineCount} != ${biasedSteps.length})`);
        if (/NaN/.test(text)) fail(`[${type} ${range} @${bias}] TXT contains NaN`);

        // ZWO export (current mapping via toZwoXml)
        const xml = toZwoXml({ ...workout, biasPct: bias, tss });
        if (!xml.includes("<workout_file>") || !xml.includes("<workout>") || /NaN/.test(xml))
          fail(`[${type} ${range} @${bias}] ZWO malformed`);
        const zwoOk = parseAndValidateZwo(xml, workout.steps);

        rows.push({
          type,
          range,
          bias,
          total: workout.totalMinutes,
          avgW,
          predominantZone: zone,
          zwoOk,
        });

        const key = `${type}|${range}`;
        byKey[key] = byKey[key] || [];
        byKey[key].push(avgW);
      }
    }
  }

  // Bias monotonicity: avgW(75) < avgW(100) < avgW(125)
  for (const [key, vals] of Object.entries(byKey)) {
    if (vals.length !== 3) fail(`[${key}] missing bias cases for monotonicity check`);
    const [a, b, c] = vals;
    if (!(a < b && b < c)) fail(`[${key}] avgIntensity not monotonic across bias (75,100,125)`);
  }

  // Print final table
  const header = `type | range | bias | total | avgW | predominantZone | zwoOk`;
  console.log(header);
  for (const r of rows) {
    console.log(
      `${r.type} | ${r.range} | ${r.bias} | ${r.total} | ${r.avgW} | ${r.predominantZone} | ${r.zwoOk ? "✓" : "✗"}`
    );
  }
}

main().catch((e) => fail(`check-exports failed: ${e?.message ?? String(e)}`));
