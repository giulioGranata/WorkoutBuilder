import { Step } from "@/lib/types";
import {
  getStepAverageWatts,
  getStepBounds,
  sumStepMinutes,
} from "@/lib/workoutSteps";
import { getZoneByPct, zoneColor, zoneLabel } from "@/lib/zones";

interface WorkoutSegmentsProps {
  steps: Step[];
  ftp: number;
}

const percent = (watts: number, ftp: number) => Math.round((watts / ftp) * 100);

export function WorkoutSegments({ steps, ftp }: WorkoutSegmentsProps) {
  if (!steps.length) return null;

  // Split steps into warmup, main, cooldown
  let start = 0;
  while (start < steps.length && steps[start].phase === "warmup") start++;
  let end = steps.length - 1;
  while (end >= start && steps[end].phase === "cooldown") end--;

  const warmupSteps = steps.slice(0, start);
  const cooldownSteps = steps.slice(end + 1);
  const mainSteps = steps.slice(start, end + 1);

  type Segment = {
    title: string;
    minutes: number;
    color: string;
    note: string;
  };

  const segments: Segment[] = [];

  const rangeFor = (segmentSteps: Step[]) => {
    if (!segmentSteps.length) {
      return "0–0% FTP";
    }
    let minPct = Number.POSITIVE_INFINITY;
    let maxPct = Number.NEGATIVE_INFINITY;
    segmentSteps.forEach((step) => {
      const [from, to] = getStepBounds(step);
      minPct = Math.min(minPct, percent(from, ftp));
      maxPct = Math.max(maxPct, percent(to, ftp));
    });
    return `${minPct}–${maxPct}% FTP`;
  };

  if (warmupSteps.length) {
    segments.push({
      title: "Warm-up",
      minutes: sumStepMinutes(warmupSteps),
      color: "var(--phase-warmup)",
      note: rangeFor(warmupSteps),
    });
  }

  if (mainSteps.length) {
    const minutes = sumStepMinutes(mainSteps);
    const workSteps = mainSteps.filter((s) => s.phase === "work");
    const zoneMinutes: Record<string, number> = {};
    workSteps.forEach((s) => {
      const watts = getStepAverageWatts(s);
      const pct = Math.round((watts / ftp) * 100);
      const zone = getZoneByPct(pct);
      zoneMinutes[zone] = (zoneMinutes[zone] ?? 0) + s.minutes;
    });
    let predominant: string | null = null;
    Object.entries(zoneMinutes).forEach(([z, mins]) => {
      if (
        !predominant ||
        mins > (zoneMinutes[predominant] ?? 0) ||
        (mins === zoneMinutes[predominant] && z > predominant)
      ) {
        predominant = z;
      }
    });
    const zone = predominant ? (predominant as any) : getZoneByPct(0);
    segments.push({
      title: "Main Set",
      minutes,
      color: zoneColor(zone),
      note: zoneLabel(zone),
    });
  }

  if (cooldownSteps.length) {
    segments.push({
      title: "Cool-down",
      minutes: sumStepMinutes(cooldownSteps),
      color: "var(--phase-cooldown)",
      note: rangeFor(cooldownSteps),
    });
  }

  return (
    <ul className="divide-y divide-[--border]">
      {segments.map((seg) => (
        <li key={seg.title} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span
              className="w-2 h-2 rounded-full ring-1 ring-inset ring-white/20"
              style={{ backgroundColor: seg.color }}
            />
            <div>
              <p className="text-sm text-[--text-primary]">{seg.title}</p>
              <p className="text-xs text-[--text-tertiary]">{seg.note}</p>
            </div>
          </div>
          <span className="text-sm text-[--text-secondary] tabular-nums text-right">
            {seg.minutes}'
          </span>
        </li>
      ))}
    </ul>
  );
}

export default WorkoutSegments;
