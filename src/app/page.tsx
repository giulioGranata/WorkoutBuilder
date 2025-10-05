'use client';

import { useState } from "react";

import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutOutput } from "@/components/WorkoutOutput";
import WorkoutTypes from "@/components/WorkoutTypes";
import type { Workout } from "@/lib/types";

export default function Page() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [attempted, setAttempted] = useState(false);

  const handleWorkoutGenerated = (newWorkout: Workout | null) => {
    setAttempted(true);
    setWorkout(newWorkout);
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <WorkoutForm
            onWorkoutGenerated={handleWorkoutGenerated}
            hasWorkout={!!workout}
          />
          <WorkoutOutput workout={workout} attempted={attempted} />
        </div>

        <WorkoutTypes />
      </main>

      <footer className="border-t border-[--border] bg-[--card] mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-start items-center">
            <div className="text-[--text-secondary] text-sm mb-4 sm:mb-0">
              © {new Date().getFullYear()} Workout Generator. Built for cyclists,
              by cyclists.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
