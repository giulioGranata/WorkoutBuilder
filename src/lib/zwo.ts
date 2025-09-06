import type { Workout } from "./types";
import { isRampStep } from "./types";

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

// Convert a Workout to Zwift .zwo XML using SteadyState blocks.
// Power is a fraction of FTP with 2 decimals, clamped to [0.30, 1.60].
// Duration is floor(minutes * 60) seconds.
export function toZwoXml(
  workout: Workout & { ftp: number; biasPct?: number }
): string {
  const bias = workout.biasPct ?? 100;
  const title = xmlEscape(workout.title);
  const description = xmlEscape(`FTP ${workout.ftp}W • Bias ${bias}%`);

  const parts: string[] = [];
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(`<workout_file>`);
  parts.push(`  <author>Workout Generator 2.0</author>`);
  parts.push(`  <name>${title}</name>`);
  parts.push(`  <description>${description}</description>`);
  parts.push(`  <workout>`);

  for (const step of workout.steps) {
    const duration = Math.floor(step.minutes * 60);
    if (isRampStep(step)) {
      const fromRatio = workout.ftp > 0 ? step.from / workout.ftp : 0;
      const toRatio = workout.ftp > 0 ? step.to / workout.ftp : 0;
      const low = clamp(fromRatio, 0.3, 1.6).toFixed(2);
      const high = clamp(toRatio, 0.3, 1.6).toFixed(2);
      parts.push(
        `    <Ramp Duration="${duration}" PowerLow="${low}" PowerHigh="${high}" />`
      );
    } else {
      const ratioRaw = workout.ftp > 0 ? step.intensity / workout.ftp : 0;
      const ratioClamped = clamp(ratioRaw, 0.3, 1.6);
      const power = ratioClamped.toFixed(2);
      parts.push(`    <SteadyState Duration="${duration}" Power="${power}" />`);
    }
  }

  parts.push(`  </workout>`);
  parts.push(`</workout_file>`);
  return parts.join("\n");
}

