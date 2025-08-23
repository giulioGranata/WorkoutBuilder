import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Step, Workout } from "@/lib/types";
import { Bike, Clock, Copy, Download, ListOrdered } from "lucide-react";
import { useState } from "react";

interface WorkoutOutputProps {
  workout: Workout | null;
}

export function WorkoutOutput({ workout }: WorkoutOutputProps) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const handleExportJSON = () => {
    if (!workout) return;

    const dataStr = JSON.stringify(workout, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${workout.title.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Workout exported as JSON file",
    });
  };

  const handleCopyToClipboard = async () => {
    if (!workout) return;

    setIsCopying(true);

    const workoutText =
      `${workout.title}\n\n` +
      workout.steps
        .map(
          (step, index) =>
            `${index + 1}. ${step.minutes}' — ${step.intensity} W — ${
              step.description
            }`
        )
        .join("\n") +
      `\n\nTotal: ${workout.totalMinutes}'`;

    try {
      await navigator.clipboard.writeText(workoutText);
      toast({
        title: "Copied to clipboard",
        description: "Workout details copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const getStepPhaseColor = (step: Step, index: number) => {
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
            </div>
          </div>

          {/* Workout Steps */}
          <div className="space-y-3" data-testid="workout-steps">
            {workout.steps.map((step, index) => (
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
                    )} text-white text-xs font-bold rounded px-2 py-1 min-w-[3rem] text-center`}
                  >
                    {step.minutes}'
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">
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

          {/* Workout Summary */}
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
                  {workout.avgIntensity || 0}W
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
