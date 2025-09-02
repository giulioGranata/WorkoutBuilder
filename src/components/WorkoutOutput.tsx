"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Step, Workout } from "@/lib/types";
import { getParamInt, setParam } from "@/lib/url";
import { toZwoXml } from "@/lib/zwo";
import {
  Bike,
  ChevronDown,
  Code,
  Download,
  FileCog,
  FileText,
  Info,
  ListOrdered,
  Minus,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import WorkoutChart from "./WorkoutChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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

export function WorkoutOutput({ workout, attempted = false }: WorkoutOutputProps) {
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

  const normalizeDescription = (text: string) =>
    text.replace(/truncated/gi, "shortened");

  const buildWorkoutText = () => {
    if (!workout) return "";
    const header = `${workout.title} • FTP: ${workout.ftp} W • Bias: ${bias}%\n\n`;
    const body = biasedSteps
      .map(
        (step, index) =>
          `${index + 1}. ${step.minutes}' — ${
            step.intensity
          } W — ${normalizeDescription(step.description)}`
      )
      .join("\n");
    const footer = `\n\nTotal: ${workout.totalMinutes}'\nAvg: ${biasedAvgIntensity} W`;
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
    };

    const header = `// ${workout.title} • FTP: ${workout.ftp} W • Bias: ${bias}%\n`;
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
    const xml = toZwoXml({ ...workout, biasPct: bias });
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
        <h2 className="text-xl font-semibold text-[--text-primary]">
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
              className="text-xl font-semibold text-[--text-primary]"
              data-testid="text-workout-title"
            >
              {workout.title}
            </h3>
          </div>

          {/* Workout Chart (biased view) */}
          <WorkoutChart steps={biasedSteps} ftp={workout.ftp} />

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
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={!workout}
                    className="w-full sm:flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500/60 bg-[--accent-solid] text-[--text-primary] hover:bg-[--accent-solidHover] border-[--text-secondary]"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="Open export menu"
                    data-testid="button-export-dropdown"
                  >
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  role="menu"
                  className="bg-[--muted] text-[--text-primary] border border-[--border] rounded-lg shadow-lg min-w-[180px] w-auto animate-in fade-in slide-in-from-top-1 duration-150 ease-out data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-1 "
                  align="start"
                  sideOffset={8}
                >
                  <DropdownMenuItem
                    onClick={handleExportJSON}
                    role="menuitem"
                    aria-label="Export workout as JSON"
                    data-testid="menu-export-json"
                    className="px-3 py-2.5 flex items-center gap-2 hover:bg-[--accent-solid]/10 rounded-md text-[--text-primary] cursor-pointer"
                  >
                    <Code className="h-4 w-4" />
                    <span>Export JSON</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleExportText}
                    role="menuitem"
                    aria-label="Export workout as Text"
                    data-testid="menu-export-text"
                    className="px-3 py-2.5 flex items-center gap-2 hover:bg-[--accent-solid]/10 rounded-md text-[--text-primary] cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Export Text</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleExportZWO}
                    role="menuitem"
                    aria-label="Export workout as ZWO"
                    data-testid="menu-export-zwo"
                    className="px-3 py-2.5 flex items-center gap-2 hover:bg-[--accent-solid]/10 rounded-md text-[--text-primary] cursor-pointer"
                  >
                    <FileCog className="h-4 w-4" />
                    <span>Export ZWO</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ) : attempted ? (
        <div className="empty-state text-center py-12" data-testid="empty-state">
          <Bike className="mx-auto text-4xl text-[--text-tertiary] mb-4 h-16 w-16" />
          <h3 className="text-lg font-medium text-[--text-secondary] mb-2">
            No workout found
          </h3>
          <p className="text-[--text-tertiary]">
            No pattern fits the selected duration range. Try a longer range or another type.
          </p>
        </div>
      ) : (
        <div className="empty-state text-center py-12" data-testid="empty-state">
          <Bike className="mx-auto text-4xl text-[--text-tertiary] mb-4 h-16 w-16" />
          <h3 className="text-lg font-medium text-[--text-secondary] mb-2">
            No workout generated yet
          </h3>
          <p className="text-[--text-tertiary]">
            Configure your settings and click "Generate Workout" to create a personalized training session.
          </p>
        </div>
      )}
    </div>
  );
}
