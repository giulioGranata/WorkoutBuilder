export type ZoneKey = "z1" | "z2" | "z3" | "z4" | "z5" | "z6";

export function getZoneByPct(p: number): ZoneKey {
  // Boundaries per spec:
  // <60% → z1, 60–75% → z2, 76–90% → z3,
  // 91–105% → z4, 106–120% → z5, >120% → z6
  if (p < 60) return "z1";
  if (p <= 75) return "z2";
  if (p <= 90) return "z3";
  if (p <= 105) return "z4";
  if (p <= 120) return "z5";
  return "z6";
}

export function zoneColor(zone: ZoneKey): string {
  const colors: Record<ZoneKey, string> = {
    z1: "var(--z1)",
    z2: "var(--z2)",
    z3: "var(--z3)",
    z4: "var(--z4)",
    z5: "var(--z5)",
    z6: "var(--z6)",
  };
  return colors[zone] ?? colors.z1;
}

export function zoneLabel(zone: ZoneKey): string {
  const labels: Record<ZoneKey, string> = {
    z1: "Recovery <60%",
    z2: "Endurance 60–75%",
    z3: "Tempo 76–90%",
    z4: "Threshold 91–105%",
    z5: "VO2max 106–120%",
    z6: "Anaerobic 125–150%",
  };
  return labels[zone] ?? labels.z1;
}
