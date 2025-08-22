import { useState } from "react";
import { WorkoutType, Difficulty, Workout } from "../lib/types";
import { generateWorkout } from "../lib/generator";

interface WorkoutFormProps {
  onWorkoutGenerated: (workout: Workout) => void;
}

export function WorkoutForm({ onWorkoutGenerated }: WorkoutFormProps) {
  const [ftp, setFtp] = useState<number>(250);
  const [durationMin, setDurationMin] = useState<number>(60);
  const [type, setType] = useState<WorkoutType>("threshold");
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const workout = generateWorkout({ ftp, durationMin, type, difficulty });
      onWorkoutGenerated(workout);
    } catch (error) {
      console.error("Error generating workout:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-850 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <div className="w-5 h-5 bg-emerald-500 rounded mr-3">
          <span className="block w-full h-full text-white text-xs font-bold flex items-center justify-center">⚙</span>
        </div>
        <h2 className="text-xl font-semibold text-white">Workout Configuration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FTP Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            FTP (Functional Threshold Power)
          </label>
          <div className="relative">
            <input
              type="number"
              value={ftp}
              onChange={(e) => setFtp(parseInt(e.target.value) || 0)}
              placeholder="250"
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-16"
              min="50"
              max="500"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400 text-sm">watts</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Your maximum sustainable power for 1 hour</p>
        </div>

        {/* Duration Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duration
          </label>
          <div className="relative">
            <input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
              placeholder="60"
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-20"
              min="20"
              max="180"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400 text-sm">minutes</span>
            </div>
          </div>
        </div>

        {/* Workout Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Workout Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as WorkoutType)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3"
            required
          >
            <option value="recovery">Recovery (50-60% FTP)</option>
            <option value="endurance">Endurance (65-75% FTP)</option>
            <option value="tempo">Tempo (76-90% FTP)</option>
            <option value="threshold">Threshold (95-105% FTP)</option>
            <option value="vo2max">VO2max (110-120% FTP)</option>
            <option value="anaerobic">Anaerobic (125-150% FTP)</option>
          </select>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["easy", "standard", "hard"] as const).map((level) => (
              <label key={level} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="sr-only peer"
                />
                <div className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-center peer-checked:bg-emerald-600 peer-checked:border-emerald-500 peer-checked:text-white transition-colors">
                  <div className="text-sm font-medium capitalize">{level}</div>
                  <div className="text-xs text-gray-400 peer-checked:text-emerald-100">
                    {level === "easy" ? "-5% FTP" : level === "hard" ? "+5% FTP" : "Base FTP"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isGenerating ? "Generating..." : "Generate Workout"}
        </button>
      </form>
    </div>
  );
}