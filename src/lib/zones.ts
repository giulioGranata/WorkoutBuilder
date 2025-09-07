export type ZoneKey = "z1" | "z2" | "z3" | "z4" | "z5";

interface ZoneDef {
  key: ZoneKey;
  min: number;
  max: number;
  color: string;
}

const ZONES: ZoneDef[] = [
  { key: "z1", min: 0, max: 59, color: "var(--z1)" },
  { key: "z2", min: 60, max: 75, color: "var(--z2)" },
  { key: "z3", min: 76, max: 90, color: "var(--z3)" },
  { key: "z4", min: 91, max: 110, color: "var(--z4)" },
  { key: "z5", min: 111, max: Infinity, color: "var(--z5)" },
];

export function getZoneByPct(pct: number): ZoneKey {
  const z = ZONES.find((zone) => pct >= zone.min && pct <= zone.max);
  return z ? z.key : "z1";
}

export function getZoneColor(zone: ZoneKey): string {
  const z = ZONES.find((z) => z.key === zone);
  return z ? z.color : "var(--z1)";
}

export function getZoneLabel(pct: number): string {
  if (pct < 60) return "Recovery <60%";
  if (pct <= 75) return "Endurance 65–75%";
  if (pct <= 90) return "Tempo 76–90%";
  if (pct <= 110) {
    if (pct >= 95 && pct <= 105) return "Threshold 95–105%";
    return "Sweet Spot/Threshold";
  }
  if (pct <= 120) return "VO2max 110–120%";
  return "Anaerobic 125–150%";
}

