import React from "react";
import { Step } from "@/lib/types";
import { applyBias } from "./WorkoutOutput";

interface WorkoutChartProps {
  steps: Step[];
  ftp: number;
  biasPct: number;
}

const getZoneColor = (watts: number, ftp: number): string => {
  if (ftp <= 0) return "var(--z1)";
  const pct = (watts / ftp) * 100;
  if (pct <= 60) return "var(--z1)";
  if (pct <= 75) return "var(--z2)";
  if (pct <= 90) return "var(--z3)";
  if (pct <= 105) return "var(--z4)";
  return "var(--z5)";
};

export function WorkoutChart({ steps, ftp, biasPct }: WorkoutChartProps) {
  const totalMinutes = steps.reduce((sum, s) => sum + s.minutes, 0);
  const xScale = 10;
  const width = totalMinutes * xScale;
  const height = ftp * 2;

  let x = 0;

  return (
    <svg width={width} height={height} data-testid="workout-chart">
      {steps.map((s, i) => {
        const w = s.minutes * xScale;
        if ("kind" in s && s.kind === "ramp") {
          const from = applyBias(s.from, biasPct);
          const to = applyBias(s.to, biasPct);
          const points = `${x},${height} ${x},${height - from} ${x + w},${
            height - to
          } ${x + w},${height}`;
          const color = getZoneColor((from + to) / 2, ftp);
          const el = (
            <polygon
              key={i}
              points={points}
              fill={color}
              data-testid={`step-${i}`}
            >
              <title>{`${s.minutes}' — ramp ${from}→${to} W — ${s.description}`}</title>
            </polygon>
          );
          x += w;
          return el;
        } else {
          const intensity = applyBias((s as any).intensity, biasPct);
          const color = getZoneColor(intensity, ftp);
          const el = (
            <rect
              key={i}
              x={x}
              y={height - intensity}
              width={w}
              height={intensity}
              fill={color}
              data-testid={`step-${i}`}
            >
              <title>{`${s.minutes}' — ${intensity} W — ${s.description}`}</title>
            </rect>
          );
          x += w;
          return el;
        }
      })}
    </svg>
  );
}

export default WorkoutChart;
