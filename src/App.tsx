import { QueryClientProvider } from "@tanstack/react-query";
import { Dumbbell } from "lucide-react";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutOutput } from "@/components/WorkoutOutput";
import WorkoutTypes from "@/components/WorkoutTypes";
import { Workout } from "@/lib/types";
import { queryClient } from "./lib/queryClient";
import { PatternLibraryProvider } from "@/hooks/usePatternLibrary";

function App() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [attempted, setAttempted] = useState(false);

  const handleWorkoutGenerated = (newWorkout: Workout | null) => {
    setAttempted(true);
    setWorkout(newWorkout);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PatternLibraryProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col bg-[--bg] text-[--text-primary] font-sans">
            {/* Header */}
            <header className="bg-[--card] border-b border-[--border]">
              <div className="max-w-5xl mx-auto py-5 px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[--accent] rounded-xl flex items-center justify-center">
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
            <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                <WorkoutForm
                  onWorkoutGenerated={handleWorkoutGenerated}
                  hasWorkout={!!workout}
                />
                <WorkoutOutput workout={workout} attempted={attempted} />
              </div>

              <WorkoutTypes />
            </main>

            {/* Footer */}
            <footer className="border-t border-[--border] bg-[--card] mt-12">
              <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row justify-start items-center">
                  <div className="text-[--text-secondary] text-sm mb-4 sm:mb-0">
                    © {new Date().getFullYear()} Workout Generator. Built for
                    cyclists, by cyclists.
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </TooltipProvider>
      </PatternLibraryProvider>
    </QueryClientProvider>
  );
}

export default App;
