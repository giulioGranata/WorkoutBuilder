import { Step } from "@/lib/types";
import { getZoneByPct, getZoneColor, getZoneLabel } from "@/lib/zones";

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
    const values: number[] = [];
    segmentSteps.forEach((s) => {
      if ((s as any).kind === "ramp") {
        const rs = s as any;
        values.push(percent(rs.from, ftp));
        values.push(percent(rs.to, ftp));
      } else {
        const ss = s as any;
        values.push(percent(ss.intensity, ftp));
      }
    });
    const min = Math.min(...values);
    const max = Math.max(...values);
    return `${min}–${max}% FTP`;
  };

  if (warmupSteps.length) {
    segments.push({
      title: "Warm-up",
      minutes: warmupSteps.reduce((sum, s) => sum + s.minutes, 0),
      color: "var(--phase-warmup)",
      note: rangeFor(warmupSteps),
    });
  }

  if (mainSteps.length) {
    const minutes = mainSteps.reduce((sum, s) => sum + s.minutes, 0);
    const total = mainSteps.reduce((sum, s) => {
      if ((s as any).kind === "ramp") {
        const rs = s as any;
        return sum + ((rs.from + rs.to) / 2) * rs.minutes;
      }
      const ss = s as any;
      return sum + ss.intensity * ss.minutes;
    }, 0);
    const avgWatts = total / minutes;
    const pct = Math.round((avgWatts / ftp) * 100);
    const zone = getZoneByPct(pct);
    const note = getZoneLabel(pct);
    segments.push({
      title: "Main Set",
      minutes,
      color: getZoneColor(zone),
      note,
    });
  }

  if (cooldownSteps.length) {
    segments.push({
      title: "Cool-down",
      minutes: cooldownSteps.reduce((sum, s) => sum + s.minutes, 0),
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
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <div>
              <p className="text-sm text-[--text-primary]">{seg.title}</p>
              <p className="text-xs text-[--text-tertiary]">{seg.note}</p>
            </div>
          </div>
          <span className="text-sm text-[--text-secondary] tabular-nums">
            {seg.minutes}'
          </span>
        </li>
      ))}
    </ul>
  );
}

export default WorkoutSegments;
