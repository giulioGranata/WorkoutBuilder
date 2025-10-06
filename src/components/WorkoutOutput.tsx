"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePatternLibrary } from "@/hooks/usePatternLibrary";
import { sanitizeFilename, triggerDownload } from "@/lib/download";
import { generateWorkout, rangeToBounds } from "@/lib/generator";
import { computeNP, computeTSS } from "@/lib/metrics";
import { DurationRangeValue, Step, Workout, WorkoutType } from "@/lib/types";
import { getCurrentUrl, getParamInt, setParam } from "@/lib/url";
import {
  applyBiasToStep,
  clamp,
  getStepAverageWatts,
  isRampStep,
  toSteadyStep,
} from "@/lib/workoutSteps";
import { toZwoXml } from "@/lib/zwo";
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
  RefreshCw,
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

export function WorkoutOutput({
  workout: initialWorkout,
  attempted = false,
}: WorkoutOutputProps) {
  const { toast } = useToast();
  const { patterns } = usePatternLibrary();

  const [workout, setWorkout] = useState<Workout | null>(initialWorkout);
  useEffect(() => {
    setWorkout(initialWorkout);
  }, [initialWorkout]);

  const biasFromUrlRef = useRef(false);
  const [bias, setBias] = useState<number>(() => {
    const url = getCurrentUrl();
    if (url) {
      const b = getParamInt(url, "bias");
      if (b !== null && b >= BIAS_MIN && b <= BIAS_MAX) {
        biasFromUrlRef.current = true;
        return b;
      }
    }
    return 100;
  });
  const nudge = (delta: number) => {
    setBias((current) => clamp(current + delta, BIAS_MIN, BIAS_MAX));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!biasFromUrlRef.current && bias === 100) return;
    const url = getCurrentUrl();
    if (!url) return;
    const id = window.setTimeout(() => {
      setParam(url, "bias", clamp(bias, BIAS_MIN, BIAS_MAX));
      biasFromUrlRef.current = true;
    }, 300);
    return () => window.clearTimeout(id);
  }, [bias]);

  const handleNextWorkout = () => {
    if (!workout) return;
    const url = getCurrentUrl();
    if (!url) return;
    const ftp = getParamInt(url, "ftp");
    const durationRange = url.searchParams.get(
      "durRange"
    ) as DurationRangeValue | null;
    const type = url.searchParams.get("type") as WorkoutType | null;
    if (ftp !== null && durationRange && type) {
      const next = generateWorkout(
        { ftp, durationRange, type },
        workout.signature,
        patterns
      );
      setWorkout(next);
    }
  };

  const canShowNext = useMemo(() => {
    if (!workout) return false;
    const url = getCurrentUrl();
    if (!url) return false;
    const durationRange = url.searchParams.get(
      "durRange"
    ) as DurationRangeValue | null;
    const type = url.searchParams.get("type") as WorkoutType | null;
    if (!durationRange || !type) return true; // if params are missing, default to showing
    const { min, max } = rangeToBounds(durationRange);
    const cap = typeof max === "number" ? max : 240;
    const variants = patterns[type];
    const WU = 10;
    const CD = 10;
    const fitCount = variants.filter((variant) => {
      const len = variant.reduce((sum, b) => sum + Math.round(b.minutes), 0);
      const total = WU + len + CD;
      return total >= min && total <= cap;
    }).length;
    return fitCount > 1;
  }, [workout, patterns]);

  // Compute a biased view of the workout (steps only)
  const biasedSteps = useMemo<Step[]>(
    () =>
      workout ? workout.steps.map((step) => applyBiasToStep(step, bias)) : [],
    [workout, bias]
  );

  // Recompute avg intensity (W) using biased steps (duration-weighted)
  const biasedAvgIntensity = useMemo<number>(() => {
    if (!workout || biasedSteps.length === 0 || !workout.totalMinutes) return 0;
    const totalWatts = biasedSteps.reduce(
      (sum, step) => sum + getStepAverageWatts(step) * step.minutes,
      0
    );
    return Math.round(totalWatts / workout.totalMinutes);
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

  const sanitizedSteps = useMemo(
    () =>
      biasedSteps.map((step) => ({
        ...step,
        description: normalizeDescription(step.description),
      })),
    [biasedSteps]
  );

  const workoutText = useMemo(() => {
    if (!workout) return "";
    const header = `${workout.title} • FTP: ${workout.ftp} W • Bias: ${bias}% • TSS: ${tss}\n\n`;
    const body = sanitizedSteps
      .map((step, index) => {
        if (isRampStep(step)) {
          return `${index + 1}. ${step.minutes}' — ramp ${step.from}→${
            step.to
          } W — ${step.description}`;
        }
        const steady = toSteadyStep(step);
        return `${index + 1}. ${step.minutes}' — ${steady.intensity} W — ${
          step.description
        }`;
      })
      .join("\n");
    const footer = `\n\nTotal: ${workout.totalMinutes}'\nAvg: ${biasedAvgIntensity} W\nTSS: ${tss}`;
    return header + body + footer;
  }, [workout, sanitizedSteps, bias, tss, biasedAvgIntensity]);

  const handleExportJSON = () => {
    if (!workout) return;

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

    const safeTitle = sanitizeFilename(workout.title);
    triggerDownload(dataBlob, `${safeTitle}_bias_${bias}.json`);

    toast({
      title: "Export successful",
      description: "Workout exported as JSON (with bias).",
    });
  };

  const handleExportText = () => {
    if (!workout) return;
    const blob = new Blob([workoutText], { type: "text/plain" });
    const safeTitle = sanitizeFilename(workout.title);
    triggerDownload(blob, `${safeTitle}.txt`);
  };

  const handleExportZWO = () => {
    if (!workout) return;
    const xml = toZwoXml({ ...workout, biasPct: bias, tss });
    const blob = new Blob([xml], { type: "text/xml" });
    const safeTitle = sanitizeFilename(workout.title);
    triggerDownload(blob, `${safeTitle}.zwo`);

    toast({
      title: "Export successful",
      description: "Workout exported as ZWO.",
    });
  };

  // Copy Text button removed in new UX

  // step list visuals removed in favor of the chart

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center">
        <ListOrdered className="mr-3 h-5 w-5 text-sky-400" />
        <h2 className="text-lg font-semibold text-zinc-100">
          Generated Workout
        </h2>
      </div>

      {/* Bias controls */}
      {workout && (
        <div className="mb-5">
          {/* Top row: label + current value */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-zinc-400">
              <span className="text-xs uppercase tracking-wider">Bias</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 cursor-pointer text-zinc-500" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[240px] rounded-md border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-200 shadow-xl backdrop-blur-sm"
                  >
                    Adjusts workout intensity on the fly. <br />
                    100% = planned watts, <br />
                    lower = easier, <br />
                    higher = harder.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="tabular-nums text-sm text-zinc-100">{bias}%</span>
          </div>

          {/* Bottom row: - slider + */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-11 w-11 rounded-full"
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
              className="flex-1 h-2 rounded-full accent-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 motion-safe:transition-colors motion-safe:duration-200"
              aria-label="Bias percentage"
              data-testid="bias-range"
            />

            <Button
              variant="secondary"
              size="icon"
              className="h-11 w-11 rounded-full"
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
          <div className="mb-8 flex items-center justify-between">
            <h3
              className="text-lg font-semibold leading-tight text-zinc-100"
              data-testid="text-workout-title"
            >
              {workout.title}
            </h3>
            {canShowNext && (
              <Button
                onClick={handleNextWorkout}
                variant="secondary"
                data-testid="button-next-workout"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Next Workout
              </Button>
            )}
          </div>

          {/* Workout Chart (biased view) */}
          <WorkoutChart steps={biasedSteps} ftp={workout.ftp} showFtpLine />

          {/* Segments */}
          <div>
            <WorkoutSegments steps={biasedSteps} ftp={workout.ftp} />
          </div>

          {/* Metrics */}
          <div className="mt-6 grid grid-cols-1 gap-3 text-center md:mt-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
              <Clock className="mx-auto mb-1 h-5 w-5 text-sky-400" />
              <div
                className="text-2xl font-semibold leading-none tabular-nums text-zinc-100"
                data-testid="text-total-minutes"
              >
                {workout.totalMinutes}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Total Time (min)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
              <Zap className="mx-auto mb-1 h-5 w-5 text-sky-400" />
              <div
                className="text-2xl font-semibold leading-none tabular-nums text-zinc-100"
                data-testid="text-avg-intensity"
              >
                {biasedAvgIntensity}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Avg Power (W)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
              <Target className="mx-auto mb-1 h-5 w-5 text-sky-400" />
              <div className="text-2xl font-semibold leading-none tabular-nums text-zinc-100">
                <span data-testid="text-tss">{tss}</span>
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                TSS
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:mt-8 sm:grid-cols-3">
            <Button
              onClick={handleExportZWO}
              variant="secondary"
              className="h-auto py-2.5 sm:px-5"
            >
              <FileCog className="h-4 w-4" />
              Export ZWO
            </Button>

            <Button
              onClick={handleExportText}
              variant="secondary"
              className="h-auto py-2.5 sm:px-5"
            >
              <FileText className="h-4 w-4" />
              Export Text
            </Button>

            <Button
              onClick={handleExportJSON}
              variant="secondary"
              className="h-auto py-2.5 sm:px-5"
            >
              <Code className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>
      ) : attempted ? (
        <div
          className="empty-state py-12 text-center"
          data-testid="empty-state"
        >
          <Bike className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h3 className="mb-2 text-lg font-semibold text-zinc-100">
            No workout found
          </h3>
          <p className="text-zinc-400">
            No pattern fits the selected duration range. Try a longer range or
            another type.
          </p>
        </div>
      ) : (
        <div
          className="empty-state py-12 text-center"
          data-testid="empty-state"
        >
          <Bike className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h3 className="mb-2 text-lg font-semibold text-zinc-100">
            No workout generated yet
          </h3>
          <p className="text-zinc-400">
            Configure your settings and click "Generate Workout" to create a
            personalized training session.
          </p>
        </div>
      )}
    </div>
  );
}
