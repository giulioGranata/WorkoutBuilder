"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Step, Workout } from "@/lib/types";
import { getParamInt, setParam } from "@/lib/url";
import { toZwoXml } from "@/lib/zwo";
import { computeNP, computeTSS } from "@/lib/metrics";
import {
  Bike,
  Clock,
  Code,
  FileCog,
  FileText,
  Info,
  ListOrdered,
  Minus,
  Plus,
  Target,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import WorkoutChart from "./WorkoutChart";
import WorkoutSegments from "./WorkoutSegments";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface WorkoutOutputProps {
  workout: Workout | null;
  attempted?: boolean;
}

const BIAS_MIN = 75;
const BIAS_MAX = 125;

// --- helpers (bias) ---
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const applyBias = (watts: number, biasPct: number) =>
  Math.max(0, Math.round(watts * (biasPct / 100)));

export function WorkoutOutput({
  workout,
  attempted = false,
}: WorkoutOutputProps) {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const biasFromUrlRef = useRef(false);
  const [bias, setBias] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const b = getParamInt(url, "bias");
      if (b !== null && b >= BIAS_MIN && b <= BIAS_MAX) {
        biasFromUrlRef.current = true;
        return b;
      }
    }
    return 100;
  });
  const nudge = (delta: number) => {
    if (bias + delta > BIAS_MAX || bias + delta < BIAS_MIN) return;
    setBias((b) => clamp(b + delta, BIAS_MIN, BIAS_MAX));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!biasFromUrlRef.current && bias === 100) return;
    const url = new URL(window.location.href);
    setParam(url, "bias", clamp(bias, BIAS_MIN, BIAS_MAX));
    biasFromUrlRef.current = true;
  }, [bias]);

  // Compute a biased view of the workout (steps only)
  const biasedSteps = useMemo<Step[]>(
    () =>
      workout
        ? workout.steps.map((s) => {
            const kind = (s as any).kind ?? "steady";
            if (kind === "ramp") {
              const rs = s as any;
              return {
                ...rs,
                kind: "ramp",
                from: applyBias(rs.from, bias),
                to: applyBias(rs.to, bias),
              };
            }
            const ss = s as any;
            return {
              ...ss,
              kind: "steady",
              intensity: applyBias(ss.intensity, bias),
            };
          })
        : [],
    [workout, bias]
  );

  // Recompute avg intensity (W) using biased steps (duration-weighted)
  const biasedAvgIntensity = useMemo<number>(() => {
    if (!workout || biasedSteps.length === 0 || !workout.totalMinutes) return 0;
    const weighted =
      biasedSteps.reduce((sum, s) => {
        const kind = (s as any).kind ?? "steady";
        if (kind === "ramp") {
          const rs = s as any;
          return sum + ((rs.from + rs.to) / 2) * rs.minutes;
        }
        const ss = s as any;
        return sum + ss.intensity * ss.minutes;
      }, 0) / workout.totalMinutes;
    return Math.round(weighted);
  }, [workout, biasedSteps]);

  const np = useMemo(() => {
    if (!workout) return 0;
    return computeNP(biasedSteps, workout.ftp);
  }, [biasedSteps, workout]);

  const tss = useMemo(() => {
    if (!workout) return 0;
    return computeTSS(workout.totalMinutes, np, workout.ftp);
  }, [workout, np]);

  const normalizeDescription = (text: string) =>
    text.replace(/truncated/gi, "shortened");

  const buildWorkoutText = () => {
    if (!workout) return "";
    const header = `${workout.title} • FTP: ${workout.ftp} W • Bias: ${bias}% • TSS: ${tss}\n\n`;
    const body = biasedSteps
      .map((step, index) => {
        const kind = (step as any).kind ?? "steady";
        const wattsText =
          kind === "ramp"
            ? `ramp ${(step as any).from}→${(step as any).to} W`
            : `${(step as any).intensity} W`;
        return `${index + 1}. ${
          step.minutes
        }' — ${wattsText} — ${normalizeDescription(step.description)}`;
      })
      .join("\n");
    const footer = `\n\nTotal: ${workout.totalMinutes}'\nAvg: ${biasedAvgIntensity} W\nTSS: ${tss}`;
    return header + body + footer;
  };

  const handleExportJSON = () => {
    if (!workout) return;

    const sanitizedSteps = biasedSteps.map((s) => ({
      ...s,
      description: normalizeDescription(s.description),
    }));

    const payload = {
      ...workout,
      steps: sanitizedSteps, // export with current bias applied
      avgIntensity: biasedAvgIntensity,
      biasPct: bias, // include bias metadata (non-breaking)
      tss,
    };

    const header = `// ${workout.title} • FTP: ${workout.ftp} W • Bias: ${bias}% • TSS ${tss}\n`;
    const dataStr = header + JSON.stringify(payload, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const safeTitle = workout.title.replace(/[^a-zA-Z0-9]/g, "_");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}_bias_${bias}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Workout exported as JSON (with bias).",
    });
  };

  const handleExportText = () => {
    if (!workout) return;
    const data = buildWorkoutText();
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const safeTitle = workout.title.replace(/[^a-zA-Z0-9]/g, "_");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportZWO = () => {
    if (!workout) return;
    const xml = toZwoXml({ ...workout, biasPct: bias, tss });
    const blob = new Blob([xml], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const safeTitle = workout.title.replace(/[^a-zA-Z0-9]/g, "_");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}.zwo`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Workout exported as ZWO.",
    });
  };

  // Copy Text button removed in new UX

  // step list visuals removed in favor of the chart

  return (
    <div className="rounded-2xl bg-[--card] border border-[--border] p-6 shadow-[--shadow-card]">
      <div className="flex items-center mb-5">
        <ListOrdered className="text-[--accent-solid] mr-3 h-5 w-5" />
        <h2 className="text-lg font-semibold text-[--text-primary]">
          Generated Workout
        </h2>
      </div>

      {/* Bias controls */}
      {workout && (
        <div className="mb-5">
          {/* Top row: label + current value */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-[--text-tertiary] uppercase tracking-wider">
                Bias
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-[--text-tertiary] cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[240px] text-sm rounded-md px-3 py-2 bg-[--card] text-[--text-primary] border border-[--border] shadow-lg"
                  >
                    Adjusts workout intensity on the fly. <br />
                    100% = planned watts, <br />
                    lower = easier, <br />
                    higher = harder.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm text-[--text-secondary] tabular-nums">
              {bias}%
            </span>
          </div>

          {/* Bottom row: - slider + */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-11 w-11 rounded-full inline-flex items-center justify-center rounded-2xl px-2 py-1 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500/60 bg-[--muted] text-[--text-secondary] hover:bg-[--border]"
              onClick={() => nudge(-1)}
              aria-label="Decrease bias"
              data-testid="bias-dec"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <input
              type="range"
              min={BIAS_MIN}
              max={BIAS_MAX}
              step={1}
              value={bias}
              onChange={(e) => setBias(parseInt(e.target.value, 10))}
              className="flex-1 h-2 accent-emerald-500"
              aria-label="Bias percentage"
              data-testid="bias-range"
            />

            <Button
              variant="outline"
              size="sm"
              className="h-11 w-11 rounded-full inline-flex items-center justify-center rounded-2xl px-2 py-1 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500/60 bg-[--muted] text-[--text-secondary] hover:bg-[--border]"
              onClick={() => nudge(1)}
              aria-label="Increase bias"
              data-testid="bias-inc"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {workout ? (
        <div className="workout-content" data-testid="workout-display">
          {/* Workout Title */}
          <div className="mb-6">
            <h3
              className="text-lg font-semibold text-[--text-primary]"
              data-testid="text-workout-title"
            >
              {workout.title}
            </h3>
          </div>

          {/* Workout Chart (biased view) */}
          <WorkoutChart steps={biasedSteps} ftp={workout.ftp} />

          {/* Segments */}
          <div className="mt-6">
            <WorkoutSegments steps={biasedSteps} ftp={workout.ftp} />
          </div>

          {/* Metrics */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-[--card-light] rounded-2xl p-5 sm:p-6">
              <div
                className="text-xl font-semibold text-[--text-primary] tabular-nums"
                data-testid="text-total-minutes"
              >
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                {workout.totalMinutes}
              </div>
              <div className="text-xs text-[--text-tertiary] tracking-wider mt-2 leading-tight">
                Total Time (min)
              </div>
            </div>
            <div className="bg-[--card-light] rounded-2xl p-5 sm:p-6">
              <div
                className="text-xl font-semibold text-[--text-primary] tabular-nums"
                data-testid="text-avg-intensity"
              >
                <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
                {biasedAvgIntensity}
              </div>
              <div className="text-xs text-[--text-tertiary] tracking-wider mt-2 leading-tight">
                Avg Power (W)
              </div>
            </div>
            <div className="bg-[--card-light] rounded-2xl p-5 sm:p-6">
              <div className="text-xl font-semibold text-[--text-primary] tabular-nums">
                <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
                <span data-testid="text-tss">{tss}</span>
              </div>
              <div className="text-xs text-[--text-tertiary] tracking-wider mt-2 leading-tight">
                TSS
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={handleExportZWO}
              className="h-12 px-5 flex items-center justify-center gap-2 rounded font-medium border border-[--border] text-[--text-secondary] bg-transparent hover:bg-[--muted]"
            >
              <FileCog className="h-4 w-4" />
              Export ZWO
            </Button>

            <Button
              onClick={handleExportText}
              variant="outline"
              className="h-12 px-5 flex items-center justify-center gap-2 rounded font-medium border border-[--border] text-[--text-secondary] bg-transparent hover:bg-[--muted]"
            >
              <FileText className="h-4 w-4" />
              Export Text
            </Button>

            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="h-12 px-5 flex items-center justify-center gap-2 rounded font-medium border border-[--border] text-[--text-secondary] bg-transparent hover:bg-[--muted]"
            >
              <Code className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>
      ) : attempted ? (
        <div
          className="empty-state text-center py-12"
          data-testid="empty-state"
        >
          <Bike className="mx-auto text-4xl text-[--text-tertiary] mb-4 h-16 w-16" />
          <h3 className="text-lg font-medium text-[--text-secondary] mb-2">
            No workout found
          </h3>
          <p className="text-[--text-tertiary]">
            No pattern fits the selected duration range. Try a longer range or
            another type.
          </p>
        </div>
      ) : (
        <div
          className="empty-state text-center py-12"
          data-testid="empty-state"
        >
          <Bike className="mx-auto text-4xl text-[--text-tertiary] mb-4 h-16 w-16" />
          <h3 className="text-lg font-medium text-[--text-secondary] mb-2">
            No workout generated yet
          </h3>
          <p className="text-[--text-tertiary]">
            Configure your settings and click "Generate Workout" to create a
            personalized training session.
          </p>
        </div>
      )}
    </div>
  );
}
