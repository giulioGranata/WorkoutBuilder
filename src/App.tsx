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

  const handleWorkoutGenerated = (newWorkout: Workout) => {
    setWorkout(newWorkout);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
          {/* Header */}
          <header className="border-b border-gray-800 bg-gray-850">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Dumbbell className="text-white h-4 w-4" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    Workout Generator 2.0
                  </h1>
                </div>
                <div className="hidden sm:flex items-center text-sm text-gray-400">
                  <span>Generate personalized cycling workouts</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <WorkoutForm onWorkoutGenerated={handleWorkoutGenerated} />
              <WorkoutOutput workout={workout} />
            </div>

            {/* Additional Information Section */}
            <div className="mt-8 bg-gray-850 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Workout Types Explained
                </h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="font-medium text-white mb-2">
                    {WORKOUT_TYPES["recovery"].label}
                  </div>
                  <div className="text-gray-400">
                    {WORKOUT_TYPES["recovery"].description}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="font-medium text-white mb-2">
                    {WORKOUT_TYPES["endurance"].label}
                  </div>
                  <div className="text-gray-400">
                    {WORKOUT_TYPES["endurance"].description}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="font-medium text-white mb-2">
                    {WORKOUT_TYPES["tempo"].label}
                  </div>
                  <div className="text-gray-400">
                    {WORKOUT_TYPES["tempo"].description}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="font-medium text-white mb-2">
                    {WORKOUT_TYPES["threshold"].label}
                  </div>
                  <div className="text-gray-400">
                    {WORKOUT_TYPES["threshold"].description}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="font-medium text-white mb-2">
                    {WORKOUT_TYPES["vo2max"].label}
                  </div>
                  <div className="text-gray-400">
                    {WORKOUT_TYPES["vo2max"].description}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="font-medium text-white mb-2">
                    {WORKOUT_TYPES["anaerobic"].label}
                  </div>
                  <div className="text-gray-400">
                    {WORKOUT_TYPES["anaerobic"].description}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-800 bg-gray-850 mt-12">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-gray-400 text-sm mb-4 sm:mb-0">
                  © 2024 Workout Generator 2.0. Built for cyclists, by cyclists.
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500 text-xs">
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
