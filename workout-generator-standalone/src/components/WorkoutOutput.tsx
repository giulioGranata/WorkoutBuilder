import { useState } from "react";
import { Workout } from "../lib/types";

interface WorkoutOutputProps {
  workout: Workout | null;
}

export function WorkoutOutput({ workout }: WorkoutOutputProps) {
  const [isCopying, setIsCopying] = useState(false);

  const handleExportJSON = () => {
    if (!workout) return;
    
    const dataStr = JSON.stringify(workout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workout.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    if (!workout) return;
    
    setIsCopying(true);
    
    const workoutText = `${workout.title}\n\n` +
      workout.steps.map((step, index) => 
        `${index + 1}. ${step.description}`
      ).join('\n') +
      `\n\nTotal: ${workout.totalMinutes}'`;
    
    try {
      await navigator.clipboard.writeText(workoutText);
      console.log("Workout copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="bg-gray-850 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-5 h-5 bg-emerald-500 rounded mr-3">
            <span className="block w-full h-full text-white text-xs font-bold flex items-center justify-center">#</span>
          </div>
          <h2 className="text-xl font-semibold text-white">Generated Workout</h2>
        </div>
        {workout && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 rounded-lg text-sm"
              title="Export as JSON"
            >
              ⬇ JSON
            </button>
            <button
              onClick={handleCopyToClipboard}
              disabled={isCopying}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 rounded-lg text-sm"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
          </div>
        )}
      </div>

      {workout ? (
        <div className="workout-content">
          {/* Workout Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {workout.title}
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <span>🕒 Total: {workout.totalMinutes} minutes</span>
            </div>
          </div>

          {/* Workout Steps */}
          <div className="space-y-3">
            {workout.steps.map((step, index) => (
              <div
                key={index}
                className="bg-gray-700/50 rounded-lg p-4 border-l-4 border-emerald-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
                    Step {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    {step.minutes} minute{step.minutes !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-white font-medium mb-1">{step.intensityPct}% FTP</div>
                <div className="text-gray-300 text-sm">{step.description}</div>
              </div>
            ))}
          </div>

          {/* Export Actions */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportJSON}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                ⬇ Export JSON
              </button>
              <button
                onClick={handleCopyToClipboard}
                disabled={isCopying}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 border border-gray-600"
              >
                📋 {isCopying ? "Copying..." : "Copy Text"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state text-center py-12">
          <div className="text-4xl text-gray-600 mb-4">🚴</div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">No workout generated yet</h3>
          <p className="text-gray-500">Configure your settings and click "Generate Workout" to create a personalized training session.</p>
        </div>
      )}
    </div>
  );
}