"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Step, Workout } from "@/lib/types";
import {
  Bike,
  Clock,
  Copy,
  Download,
  ListOrdered,
  Minus,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";

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

  // Bias state: -75% .. +125%, step 1%
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
      `${workout.title} (bias ${bias}%)\n\n` +
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

  const getStepPhaseColor = (step: Step, _index: number) => {
    if (step.phase === "warmup") return "border-l-blue-500";
    if (step.phase === "cooldown") return "border-l-purple-500";
    if (step.phase === "recovery") return "border-l-yellow-500";
    if (step.phase === "work") return "border-l-emerald-500";
    return "border-l-gray-500";
  };

  const getStepPhaseLabel = (step: Step) => {
    if (step.phase === "warmup") return "Warm-up";
    if (step.phase === "cooldown") return "Cool-down";
    if (step.phase === "recovery") return "Recovery";
    if (step.phase === "work") return "Main Work";
    return "Work";
  };

  const getStepPhaseTextColor = (step: Step) => {
    if (step.phase === "warmup") return "text-blue-400";
    if (step.phase === "cooldown") return "text-purple-400";
    if (step.phase === "recovery") return "text-yellow-400";
    if (step.phase === "work") return "text-emerald-400";
    return "text-gray-400";
  };

  const getStepBadgeColor = (step: Step) => {
    if (step.phase === "warmup") return "bg-blue-500";
    if (step.phase === "cooldown") return "bg-purple-500";
    if (step.phase === "recovery") return "bg-yellow-500";
    if (step.phase === "work") return "bg-emerald-500";
    return "bg-gray-500";
  };

  return (
    <div className="bg-gray-850 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ListOrdered className="text-emerald-500 mr-3 h-5 w-5" />
          <h2 className="text-xl font-semibold text-white">
            Generated Workout
          </h2>
        </div>

        {workout && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
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
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Bias
            </span>
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
              onClick={() => nudge(-1)}
              title="Decrease bias by 1%"
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
              className="w-44 accent-emerald-500"
              aria-label="Bias percentage"
              data-testid="bias-range"
            />
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
              onClick={() => nudge(1)}
              title="Increase bias by 1%"
              data-testid="bias-inc"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-300 tabular-nums w-12 text-right">
              {bias}%
            </span>
          </div>
        </div>
      )}

      {workout ? (
        <div className="workout-content" data-testid="workout-display">
          {/* Workout Title */}
          <div className="mb-6">
            <h3
              className="text-2xl font-bold text-white mb-2"
              data-testid="text-workout-title"
            >
              {workout.title}
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="mr-2 h-4 w-4" />
              <span data-testid="text-total-time">
                Total: {workout.totalMinutes}'
              </span>
              <span className="ml-3 text-gray-500">•</span>
              <span className="text-sm text-gray-400">
                Bias: <span className="tabular-nums">{bias}%</span>
              </span>
            </div>
          </div>

          {/* Workout Steps (biased view) */}
          <div className="space-y-3" data-testid="workout-steps">
            {biasedSteps.map((step, index) => (
              <div
                key={index}
                className={`workout-step bg-gray-700/50 rounded-lg p-4 border-l-4 ${getStepPhaseColor(
                  step,
                  index
                )}`}
                data-testid={`workout-step-${index}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`${getStepPhaseTextColor(
                      step
                    )} text-xs font-medium uppercase tracking-wider`}
                  >
                    {getStepPhaseLabel(step)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Step {index + 1}
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div
                    className={`${getStepBadgeColor(
                      step
                    )} text-white text-lg font-bold rounded min-w-[3rem] text-center`}
                  >
                    {step.minutes}'
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-xl font-bold mb-1">
                      {step.intensity} W
                    </div>
                    <div className="text-gray-300 text-sm">
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Workout Summary (avg in biased W) */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div
                  className="text-2xl font-bold text-emerald-400"
                  data-testid="text-total-minutes"
                >
                  {workout.totalMinutes}'
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Total Time
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div
                  className="text-2xl font-bold text-blue-400"
                  data-testid="text-work-minutes"
                >
                  {workout.workMinutes || 0}'
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Work Time
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div
                  className="text-2xl font-bold text-yellow-400"
                  data-testid="text-recovery-minutes"
                >
                  {workout.recoveryMinutes || 0}'
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Recovery
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div
                  className="text-2xl font-bold text-purple-400"
                  data-testid="text-avg-intensity"
                >
                  {biasedAvgIntensity}W
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Avg Intensity
                </div>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleExportJSON}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                data-testid="button-export-json-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                disabled={isCopying}
                variant="outline"
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 border-gray-600"
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
          <Bike className="mx-auto text-4xl text-gray-600 mb-4 h-16 w-16" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            No workout generated yet
          </h3>
          <p className="text-gray-500">
            Configure your settings and click "Generate Workout" to create a
            personalized training session.
          </p>
        </div>
      )}
    </div>
  );
}
