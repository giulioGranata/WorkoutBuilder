"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Step, Workout } from "@/lib/types";
import {
  Bike,
  Copy,
  Download,
  Info,
  ListOrdered,
  Minus,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface WorkoutOutputProps {
  workout: Workout | null;
}

const BIAS_MIN = 75;
const BIAS_MAX = 125;

// --- helpers (bias) ---
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const applyBias = (watts: number, biasPct: number) =>
  Math.max(0, Math.round(watts * (biasPct / 100)));

export function WorkoutOutput({ workout }: WorkoutOutputProps) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const [bias, setBias] = useState<number>(100);
  const nudge = (delta: number) => {
    if (bias + delta > BIAS_MAX || bias + delta < BIAS_MIN) return;
    setBias((b) => clamp(b + delta, BIAS_MIN, BIAS_MAX));
  };

  // Compute a biased view of the workout (steps only)
  const biasedSteps = useMemo<Step[]>(
    () =>
      workout
        ? workout.steps.map((s) => ({
            ...s,
            intensity: applyBias(s.intensity, bias),
          }))
        : [],
    [workout, bias]
  );

  // Recompute avg intensity (W) using biased steps (duration-weighted)
  const biasedAvgIntensity = useMemo<number>(() => {
    if (!workout || biasedSteps.length === 0 || !workout.totalMinutes) return 0;
    const weighted =
      biasedSteps.reduce((sum, s) => sum + s.intensity * s.minutes, 0) /
      workout.totalMinutes;
    return Math.round(weighted);
  }, [workout, biasedSteps]);

  const handleExportJSON = () => {
    if (!workout) return;

    const payload = {
      ...workout,
      steps: biasedSteps, // export with current bias applied
      avgIntensity: biasedAvgIntensity,
      biasPct: bias, // include bias metadata (non-breaking)
    };

    const dataStr = JSON.stringify(payload, null, 2);
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

  const handleCopyToClipboard = async () => {
    if (!workout) return;

    setIsCopying(true);

    const workoutText =
      `${workout.title} • FTP: ${workout.ftp}W • Bias: ${bias}%\n\n` +
      biasedSteps
        .map(
          (step, index) =>
            `${index + 1}. ${step.minutes}' — ${step.intensity} W — ${
              step.description
            }`
        )
        .join("\n") +
      `\n\nTotal: ${workout.totalMinutes}'\nAvg: ${biasedAvgIntensity} W`;

    try {
      await navigator.clipboard.writeText(workoutText);
      toast({
        title: "Copied to clipboard",
        description: "Workout details copied (with bias).",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const getZoneColors = (watts: number, ftp: number) => {
    if (ftp <= 0) return { border: "border-l-[--z1]", badge: "bg-[--z1]" };
    const pct = (watts / ftp) * 100;

    if (pct <= 60) return { border: "border-l-[--z1]", badge: "bg-[--z1]" };
    if (pct <= 75) return { border: "border-l-[--z2]", badge: "bg-[--z2]" };
    if (pct <= 90) return { border: "border-l-[--z3]", badge: "bg-[--z3]" };
    if (pct <= 105) return { border: "border-l-[--z4]", badge: "bg-[--z4]" };
    return { border: "border-l-[--z5]", badge: "bg-[--z5]" };
  };

  const getStepBorderColor = (step: Step, ftp: number) => {
    if (step.phase === "warmup") return "border-l-[--phase-warmup]";
    if (step.phase === "cooldown") return "border-l-[--phase-cooldown]";
    return getZoneColors(step.intensity, ftp).border;
  };

  const getStepBadgeClasses = (step: Step, ftp: number) => {
    const baseClasses =
      "text-white text-xs font-bold rounded px-2 py-1 min-w-[3rem] text-center tabular-nums";
    if (step.phase === "warmup") return `${baseClasses} bg-[--phase-warmup]`;
    if (step.phase === "cooldown")
      return `${baseClasses} bg-[--phase-cooldown]`;
    return `${baseClasses} ${getZoneColors(step.intensity, ftp).badge}`;
  };

  return (
    <div className="rounded-2xl bg-[--card] border border-[--border] p-6 shadow-[--shadow-card]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ListOrdered className="text-[--accent-solid] mr-3 h-5 w-5" />
          <h2 className="text-xl font-semibold text-[--text-primary]">
            Generated Workout
          </h2>
        </div>

        {workout && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="inline-flex items-center justify-center rounded-2xl px-3 py-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500/60 bg-[--muted] text-[--text-secondary] hover:bg-[--border]"
              title="Export as JSON"
              data-testid="button-export-json"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              disabled={isCopying}
              className="inline-flex items-center justify-center rounded-2xl px-3 py-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500/60 bg-[--muted] text-[--text-secondary] hover:bg-[--border]"
              title="Copy to clipboard"
              data-testid="button-copy-text"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
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
              className="text-xl font-semibold text-[--text-primary]"
              data-testid="text-workout-title"
            >
              {workout.title}
            </h3>
          </div>

          {/* Workout Steps (biased view) */}
          <div className="space-y-3" data-testid="workout-steps">
            {biasedSteps.map((step, index) => (
              <>
                <div
                  key={index}
                  className={`bg-[--muted]/60 rounded-xl p-4 border border-[--border] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] border-l-4 ${getStepBorderColor(
                    step,
                    workout.ftp
                  )}`}
                  data-testid={`workout-step-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={getStepBadgeClasses(step, workout.ftp)}>
                      {step.minutes}'
                    </div>
                    <div className="flex-1">
                      <div className="text-[--text-primary] font-bold tabular-nums">
                        {step.intensity} W
                      </div>
                      <div className="text-[--text-secondary] text-sm">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block border-t border-[--border]/60 my-4" />
              </>
            ))}
          </div>

          {/* Workout Summary (avg in biased W) */}
          <div className="mt-6 pt-6 border-t border-[--border]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-[--muted]/30 rounded-lg p-3">
                <div
                  className="text-2xl font-bold text-[--text-primary] tabular-nums"
                  data-testid="text-total-minutes"
                >
                  {workout.totalMinutes}'
                </div>
                <div className="text-xs text-[--text-tertiary] uppercase tracking-wider">
                  Total Time
                </div>
              </div>
              <div className="bg-[--muted]/30 rounded-lg p-3">
                <div
                  className="text-2xl font-bold text-[--text-primary] tabular-nums"
                  data-testid="text-work-minutes"
                >
                  {workout.workMinutes || 0}'
                </div>
                <div className="text-xs text-[--text-tertiary] uppercase tracking-wider">
                  Work Time
                </div>
              </div>
              <div className="bg-[--muted]/30 rounded-lg p-3">
                <div
                  className="text-2xl font-bold text-[--text-primary] tabular-nums"
                  data-testid="text-recovery-minutes"
                >
                  {workout.recoveryMinutes || 0}'
                </div>
                <div className="text-xs text-[--text-tertiary] uppercase tracking-wider">
                  Recovery
                </div>
              </div>
              <div className="bg-[--muted]/30 rounded-lg p-3">
                <div
                  className="text-2xl font-bold text-[--text-primary] tabular-nums"
                  data-testid="text-avg-intensity"
                >
                  {biasedAvgIntensity}W
                </div>
                <div className="text-xs text-[--text-tertiary] uppercase tracking-wider">
                  Avg Intensity
                </div>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="mt-6 pt-6 border-t border-[--border]">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleExportJSON}
                className="flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500/60 bg-[--accent-solid] text-[--text-primary] hover:bg-[--accent-solidHover]"
                data-testid="button-export-json-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                disabled={isCopying}
                variant="outline"
                className="flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500/60 bg-[--muted] text-[--text-secondary] hover:bg-[--border]"
                data-testid="button-copy-text-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                {isCopying ? "Copying..." : "Copy Text"}
              </Button>
            </div>
          </div>
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
