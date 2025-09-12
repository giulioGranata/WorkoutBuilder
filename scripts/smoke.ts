// Lightweight smoke test for workout generation, bias application and exports.
import { generateWorkout, rangeToBounds } from "../src/lib/generator.ts";
import { Step, WorkoutType, DurationRangeValue } from "../src/lib/types.ts";
import { toZwoXml } from "../src/lib/zwo.ts";
import {
  applyBias,
  computeMidpointW,
  computeNP,
  computeTSS,
  getPredominantZone,
} from "../src/lib/smokeUtils.ts";
import { zoneLabel, zoneColor } from "../src/lib/zones.ts";

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

interface SummaryRow {
  type: string;
  range: string;
  bias: number;
  totalMinutes: number;
  avgIntensity: number;
  tss: number;
  predominantZone: string;
}

const summary: SummaryRow[] = [];

for (const type of TYPES) {
  for (const range of RANGES) {
    const workout = generateWorkout({ ftp: FTP, durationRange: range, type });
    if (!workout) {
      console.warn(`[SMOKE][${type} ${range}] skipped (no workout)`);
      continue;
    }
    const sumMinutes = workout.steps.reduce((s, st) => s + st.minutes, 0);
    if (sumMinutes !== workout.totalMinutes) {
      console.error(`[SMOKE][${type} ${range}] step minutes mismatch`);
      process.exit(1);
    }
    const { min, max } = rangeToBounds(range);
    if (workout.totalMinutes < min || (max && workout.totalMinutes > max)) {
      console.error(`[SMOKE][${type} ${range}] totalMinutes out of range`);
      process.exit(1);
    }
    for (const st of workout.steps) {
      if (st.minutes <= 0) {
        console.error(`[SMOKE][${type} ${range}] non-positive minutes`);
        process.exit(1);
      }
      const kind = (st as any).kind ?? "steady";
      if (kind === "ramp") {
        const r = st as any;
        if (r.from < 0 || r.to < 0) {
          console.error(`[SMOKE][${type} ${range}] negative ramp value`);
          process.exit(1);
        }
        const mid = computeMidpointW(r);
        if (!isFinite(mid)) {
          console.error(`[SMOKE][${type} ${range}] ramp midpoint NaN`);
          process.exit(1);
        }
      } else {
        const ss = st as any;
        if (ss.intensity < 0) {
          console.error(`[SMOKE][${type} ${range}] negative intensity`);
          process.exit(1);
        }
      }
    }

    const tssList: number[] = [];

    for (const bias of BIASES) {
      const stepsBiased: Step[] = workout.steps.map((s) => {
        const kind = (s as any).kind ?? "steady";
        if (kind === "ramp") {
          const r = s as any;
          return {
            ...r,
            kind: "ramp",
            from: applyBias(r.from, bias),
            to: applyBias(r.to, bias),
          };
        }
        const ss = s as any;
        return {
          ...ss,
          kind: "steady",
          intensity: applyBias(ss.intensity, bias),
        };
      });

      const avgIntensity = Math.round(
        stepsBiased.reduce((sum, s: any) => {
          return (
            sum +
            (s.kind === "ramp"
              ? ((s.from + s.to) / 2) * s.minutes
              : s.intensity * s.minutes)
          );
        }, 0) / workout.totalMinutes
      );

      const np = computeNP(stepsBiased as any, FTP);
      const tss = computeTSS(workout.totalMinutes, np, FTP);
      if (np <= 0 || tss <= 0) {
        console.error(`[SMOKE][${type} ${range} @ bias ${bias}] NP/TSS invalid`);
        process.exit(1);
      }
      tssList.push(tss);

      const zone = getPredominantZone(stepsBiased, FTP);
      const label = zoneLabel(zone);
      const color = zoneColor(zone);
      if (!label || !color) {
        console.error(`[SMOKE][${type} ${range} @ bias ${bias}] zone invalid`);
        process.exit(1);
      }
      {
        const ALLOWED = new Set(["z1", "z2", "z3", "z4", "z5", "z6"]);
        if (!ALLOWED.has(zone as any)) {
          throw new Error(
            `[SMOKE] invalid predominantZone=${zone} for ${type} ${range} @ bias ${bias}`
          );
        }
      }

      const jsonPayload = {
        ...workout,
        steps: stepsBiased,
        avgIntensity,
        biasPct: bias,
        tss,
      };
      const jsonStr = JSON.stringify(jsonPayload);
      const parsed = JSON.parse(jsonStr);
      if (
        typeof parsed.biasPct !== "number" ||
        typeof parsed.tss !== "number" ||
        typeof parsed.avgIntensity !== "number" ||
        !Array.isArray(parsed.steps) ||
        parsed.steps.length === 0
      ) {
        console.error(`[SMOKE][${type} ${range} @ bias ${bias}] JSON malformed`);
        process.exit(1);
      }

      const textHeader = `${workout.title} • FTP: ${workout.ftp} W • Bias: ${bias}% • TSS: ${tss}\n\n`;
      const textBody = stepsBiased
        .map((step, i) => {
          const kind = (step as any).kind;
          const watts =
            kind === "ramp"
              ? `${(step as any).from}-${(step as any).to} W`
              : `${(step as any).intensity} W`;
          return `${i + 1}. ${step.minutes}' — ${watts} — ${step.description}`;
        })
        .join("\n");
      const textFooter = `\n\nTotal: ${workout.totalMinutes}'\nAvg: ${avgIntensity} W\nTSS: ${tss}`;
      const text = textHeader + textBody + textFooter;
      if (!text.trim()) {
        console.error(`[SMOKE][${type} ${range} @ bias ${bias}] TXT empty`);
        process.exit(1);
      }
      for (const line of textBody.split("\n")) {
        if (!/\d+'\s—\s.*W\s—\s/.test(line)) {
          console.error(`[SMOKE][${type} ${range} @ bias ${bias}] TXT malformed`);
          process.exit(1);
        }
      }

      const xml = toZwoXml({
        ...workout,
        steps: stepsBiased,
        ftp: FTP,
        biasPct: bias,
        tss,
      });
      if (
        !xml.includes("<workout_file>") ||
        !xml.includes("<workout>") ||
        /NaN/.test(xml)
      ) {
        console.error(`[SMOKE][${type} ${range} @ bias ${bias}] ZWO malformed`);
        process.exit(1);
      }
      if (!/<Ramp[^>]*PowerLow=\"[^\"]+\" PowerHigh=\"[^\"]+\"/.test(xml)) {
        console.error(`[SMOKE][${type} ${range} @ bias ${bias}] ZWO ramp attrs missing`);
        process.exit(1);
      }
      if (!/<(SteadyState|Ramp)[^>]*(Power|PowerLow)=/.test(xml)) {
        console.error(`[SMOKE][${type} ${range} @ bias ${bias}] ZWO power attrs missing`);
        process.exit(1);
      }

      summary.push({
        type,
        range,
        bias,
        totalMinutes: workout.totalMinutes,
        avgIntensity,
        tss,
        predominantZone: zone,
      });
    }

    if (!(tssList[0] < tssList[1] && tssList[1] < tssList[2])) {
      console.error(`[SMOKE][${type} ${range}] TSS not monotonic`);
      process.exit(1);
    }
  }
}

console.table(summary);
