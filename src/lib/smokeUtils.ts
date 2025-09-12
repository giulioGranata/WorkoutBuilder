import { Step } from "./types";
import { computeNP as baseComputeNP, computeTSS as baseComputeTSS } from "./metrics";
import { getZoneByPct, ZoneKey } from "./zones";

export const computeNP = baseComputeNP;
export const computeTSS = baseComputeTSS;
export { getZoneByPct };

// Simple bias application matching the UI logic.
export const applyBias = (watts: number, biasPct: number) =>
  Math.max(0, Math.round(watts * (biasPct / 100)));

// Return midpoint watts for a ramp step or intensity for steady steps.
export function computeMidpointW(step: Step): number {
  const kind = (step as any).kind ?? "steady";
  if (kind === "ramp") {
    const r = step as any;
    return (r.from + r.to) / 2;
  }
  return (step as any).intensity ?? 0;
}

// Determine predominant training zone within the main set.
export function getPredominantZone(steps: Step[], ftp: number): ZoneKey {
  if (!ftp) return getZoneByPct(0);
  const zoneMinutes: Record<string, number> = {};
  steps
    .filter((s) => s.phase === "work")
    .forEach((s) => {
      const kind = (s as any).kind ?? "steady";
      const watts =
        kind === "ramp"
          ? ((s as any).from + (s as any).to) / 2
          : (s as any).intensity;
      const pct = Math.round((watts / ftp) * 100);
      const zone = getZoneByPct(pct);
      zoneMinutes[zone] = (zoneMinutes[zone] ?? 0) + s.minutes;
    });
  let predominant: ZoneKey | null = null;
  Object.entries(zoneMinutes).forEach(([z, mins]) => {
    if (
      !predominant ||
      mins > (zoneMinutes[predominant] ?? 0) ||
      (mins === zoneMinutes[predominant] && z > predominant)
    ) {
      predominant = z as ZoneKey;
    }
  });
  return predominant ?? getZoneByPct(0);
}

