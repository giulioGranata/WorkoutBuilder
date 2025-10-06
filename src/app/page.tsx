"use client";

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
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <WorkoutForm
            onWorkoutGenerated={handleWorkoutGenerated}
            hasWorkout={!!workout}
          />
          <WorkoutOutput workout={workout} attempted={attempted} />
        </div>

        <WorkoutTypes />
      </main>
    </div>
  );
}
