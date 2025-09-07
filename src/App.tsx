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
          <header className="bg-[--card] border-b border-[--border]">
            <div className="max-w-5xl mx-auto py-5 px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[--accent-solid] rounded-xl flex items-center justify-center">
                      <Dumbbell className="text-white h-5 w-5" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-[--text-primary]">
                      Workout Generator
                    </h1>
                  </div>
                  <p className="text-sm text-[--text-secondary] mt-2">
                    Generate personalized cycling workouts
                  </p>
                </div>
                <span className="text-[--text-tertiary] text-xs mt-4 sm:mt-0 sm:text-right">
                  Powered by science-based training zones
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-5xl mx-auto px-4 py-8">
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
                <h3 className="text-base md:text-lg font-semibold text-[--text-primary]">
                  Workout Types Explained
                </h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[--z1] mr-2" />
                    <div className="font-medium text-[--text-primary]">
                      {WORKOUT_TYPES["recovery"].label}
                    </div>
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["recovery"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[--z2] mr-2" />
                    <div className="font-medium text-[--text-primary]">
                      {WORKOUT_TYPES["endurance"].label}
                    </div>
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["endurance"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[--z3] mr-2" />
                    <div className="font-medium text-[--text-primary]">
                      {WORKOUT_TYPES["tempo"].label}
                    </div>
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["tempo"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[--z4] mr-2" />
                    <div className="font-medium text-[--text-primary]">
                      {WORKOUT_TYPES["threshold"].label}
                    </div>
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["threshold"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[--z5] mr-2" />
                    <div className="font-medium text-[--text-primary]">
                      {WORKOUT_TYPES["vo2max"].label}
                    </div>
                  </div>
                  <div className="text-[--text-secondary]">
                    {WORKOUT_TYPES["vo2max"].description}
                  </div>
                </div>
                <div className="bg-[--muted]/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[--z5] mr-2" />
                    <div className="font-medium text-[--text-primary]">
                      {WORKOUT_TYPES["anaerobic"].label}
                    </div>
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
            <div className="max-w-5xl mx-auto px-4 py-6">
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
