import type { Step } from "@/lib/types";

const MAX_PERC = 1.6; // 160% FTP = full height
const GAP_PCT = 0.6; // horizontal gap between bars (percentage of total width)

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

type RampLikeStep = Step & { from: number; to: number };
type SteadyLikeStep = Step & { intensity: number };

const isRampStep = (step: Step): step is RampLikeStep =>
  "from" in step && "to" in step && typeof step.from === "number" && typeof step.to === "number";

const isSteadyStep = (step: Step): step is SteadyLikeStep =>
  "intensity" in step && typeof step.intensity === "number";

export type BarShape = "rect" | "trapezoid";
export type BarGeom = {
  x: number;
  y: number;
  w: number;
  h: number;
  s: Step;
  shape: BarShape;
  topY: number;
  yStart: number;
  yEnd: number;
};

export function heightPct(watts: number, ftp: number): number {
  if (ftp <= 0) return 0;
  const ratio = clamp(watts / ftp, 0, MAX_PERC) / MAX_PERC;
  return ratio * 100;
}

export function computeWorkoutGeometry(
  steps: Step[],
  ftp: number
): { totalMinutes: number; bars: BarGeom[] } {
  const totalMinutes = steps.reduce((acc, step) => acc + (step.minutes || 0), 0);
  const count = steps.length;
  const gapsTotal = Math.max(0, count - 1) * GAP_PCT;
  const available = Math.max(0, 100 - gapsTotal);

  let xCursor = 0;
  const bars: BarGeom[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const minutes = Math.max(0, step.minutes ?? 0);
    const w = totalMinutes > 0 ? (minutes / totalMinutes) * available : 0;

    let h = 0;
    let y = 0;
    let yStart = 0;
    let yEnd = 0;
    let shape: BarShape = "rect";

    if (isRampStep(step)) {
      const fromH = heightPct(step.from, ftp);
      const toH = heightPct(step.to, ftp);
      h = Math.max(fromH, toH);
      y = 100 - h;
      yStart = 100 - fromH;
      yEnd = 100 - toH;
      shape = "trapezoid";
    } else if (isSteadyStep(step)) {
      const intH = heightPct(step.intensity, ftp);
      h = intH;
      y = 100 - h;
      yStart = 100 - intH;
      yEnd = 100 - intH;
    } else {
      // Unknown step shape; treat as zero-height placeholder to avoid NaNs.
      h = 0;
      y = 100;
      yStart = 100;
      yEnd = 100;
    }

    const topY = Math.min(yStart, yEnd);
    bars.push({ x: xCursor, y, w, h, s: step, shape, topY, yStart, yEnd });

    xCursor += w + (i < steps.length - 1 ? GAP_PCT : 0);
  }

  return { totalMinutes, bars };
}

// Build a rounded right-angled trapezoid path.
// Corners order (clockwise): BL -> BR -> TR -> TL.
export function roundedTrapezoidPath(
  x0: number,
  x1: number,
  yBase: number,
  yStart: number,
  yEnd: number,
  rBase: number = 2
): string {
  const w = Math.max(0, x1 - x0);
  if (w === 0) return `M ${x0} ${yBase} Z`;

  // Top edge vector and length
  const dx = x1 - x0;
  const dy = yEnd - yStart;
  const L = Math.hypot(dx, dy);

  // Limit radius so it fits all sides
  const hl = Math.max(0, yBase - yStart);
  const hr = Math.max(0, yBase - yEnd);
  const r = Math.max(
    0,
    Math.min(rBase, w / 2, hl / 2, hr / 2, L > 0 ? L / 2 : rBase)
  );
  if (r === 0) {
    // Sharp path fallback
    return `M ${x0} ${yBase} L ${x1} ${yBase} L ${x1} ${yEnd} L ${x0} ${yStart} Z`;
  }

  if (L === 0) {
    // Degenerate to a rounded rectangle (top is flat)
    const yTop = yStart;
    return [
      `M ${x0 + r} ${yBase}`,
      `L ${x1 - r} ${yBase}`,
      `Q ${x1} ${yBase} ${x1} ${yBase - r}`,
      `L ${x1} ${yTop + r}`,
      `Q ${x1} ${yTop} ${x1 - r} ${yTop}`,
      `L ${x0 + r} ${yTop}`,
      `Q ${x0} ${yTop} ${x0} ${yTop + r}`,
      `L ${x0} ${yBase - r}`,
      `Q ${x0} ${yBase} ${x0 + r} ${yBase}`,
      "Z",
    ].join(" ");
  }

  const t = r / L;
  const pTLx = x0 + dx * t;
  const pTLy = yStart + dy * t;
  const pTRx = x0 + dx * (1 - t);
  const pTRy = yStart + dy * (1 - t);

  return [
    `M ${x0 + r} ${yBase}`,
    `L ${x1 - r} ${yBase}`,
    `Q ${x1} ${yBase} ${x1} ${yBase - r}`,
    `L ${x1} ${yEnd + r}`,
    `Q ${x1} ${yEnd} ${pTRx} ${pTRy}`,
    `L ${pTLx} ${pTLy}`,
    `Q ${x0} ${yStart} ${x0} ${yStart + r}`,
    `L ${x0} ${yBase - r}`,
    `Q ${x0} ${yBase} ${x0 + r} ${yBase}`,
    "Z",
  ].join(" ");
}
