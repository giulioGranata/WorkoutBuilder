import { useState } from "react";
import { WorkoutForm } from "./components/WorkoutForm";
import { WorkoutOutput } from "./components/WorkoutOutput";
import { Workout } from "./lib/types";

function App() {
  const [workout, setWorkout] = useState<Workout | null>(null);

  const handleWorkoutGenerated = (newWorkout: Workout) => {
    setWorkout(newWorkout);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-850">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">🏋</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Workout Generator 2.0</h1>
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
            <h3 className="text-lg font-semibold text-white">Workout Types Explained</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="font-medium text-white mb-2">Recovery (50-60% FTP)</div>
              <div className="text-gray-400">Easy-paced riding to promote active recovery and blood flow</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="font-medium text-white mb-2">Endurance (65-75% FTP)</div>
              <div className="text-gray-400">Aerobic base building with steady, comfortable efforts</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="font-medium text-white mb-2">Tempo (76-90% FTP)</div>
              <div className="text-gray-400">Moderately hard efforts that improve efficiency at race pace</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="font-medium text-white mb-2">Threshold (95-105% FTP)</div>
              <div className="text-gray-400">Sustainable hard efforts that improve lactate threshold power</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="font-medium text-white mb-2">VO2max (110-120% FTP)</div>
              <div className="text-gray-400">High-intensity intervals that boost maximum oxygen uptake</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="font-medium text-white mb-2">Anaerobic (125-150% FTP)</div>
              <div className="text-gray-400">Short, very high-intensity efforts for neuromuscular power</div>
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
              <span className="text-gray-500 text-xs">Powered by science-based training zones</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;