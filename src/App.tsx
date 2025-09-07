import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutOutput } from "@/components/WorkoutOutput";
import { Workout, WORKOUT_TYPES } from "@/lib/types";
import { QueryClientProvider } from "@tanstack/react-query";
import { Dumbbell } from "lucide-react";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";

function App() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [attempted, setAttempted] = useState(false);

  const handleWorkoutGenerated = (newWorkout: Workout | null) => {
    setAttempted(true);
    setWorkout(newWorkout);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-[--bg] text-[--text-primary] font-sans">
          {/* Header */}
          <header className="border-b border-[--border] bg-[--card]">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[--accent-solid] rounded-lg flex items-center justify-center">
                    <Dumbbell className="text-white h-4 w-4" />
                  </div>
                  <h1 className="text-2xl font-bold text-[--text-primary]">
                    Workout Generator
                  </h1>
                </div>
                <div className="hidden sm:flex items-center text-sm text-[--text-secondary]">
                  <span>Generate personalized cycling workouts</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <WorkoutForm onWorkoutGenerated={handleWorkoutGenerated} />
              <WorkoutOutput workout={workout} attempted={attempted} />
            </div>

            {/* Additional Information Section */}
            <div className="mt-8 rounded-2xl bg-[--card] border border-[--border] p-6 shadow-[--shadow-card]">
              <div className="flex items-center mb-4">
                <div className="w-5 h-5 bg-[--phase-warmup] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <h3 className="text-lg font-semibold text-[--text-primary]">
                  Workout Types Explained
                </h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="font-medium text-[--text-primary] mb-2">
                    {WORKOUT_TYPES["recovery"].label}
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["recovery"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="font-medium text-[--text-primary] mb-2">
                    {WORKOUT_TYPES["endurance"].label}
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["endurance"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="font-medium text-[--text-primary] mb-2">
                    {WORKOUT_TYPES["tempo"].label}
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["tempo"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="font-medium text-[--text-primary] mb-2">
                    {WORKOUT_TYPES["threshold"].label}
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["threshold"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="font-medium text-[--text-primary] mb-2">
                    {WORKOUT_TYPES["vo2max"].label}
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["vo2max"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="font-medium text-[--text-primary] mb-2">
                    {WORKOUT_TYPES["anaerobic"].label}
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["anaerobic"].description}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-[--border] bg-[--card] mt-12">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-[--text-secondary] text-sm mb-4 sm:mb-0">
                  © {new Date().getFullYear()} Workout Generator. Built for
                  cyclists, by cyclists.
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-[--text-tertiary] text-xs">
                    Powered by science-based training zones
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
