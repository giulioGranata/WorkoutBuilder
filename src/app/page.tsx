'use client';

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { useState } from "react";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutOutput } from "@/components/WorkoutOutput";
import WorkoutTypes from "@/components/WorkoutTypes";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Workout } from "@/lib/types";

export default function Page() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [attempted, setAttempted] = useState(false);

  const handleWorkoutGenerated = (newWorkout: Workout | null) => {
    setAttempted(true);
    setWorkout(newWorkout);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--bg] text-[--text-primary] font-sans">
      <header className="bg-[--card] border-b border-[--border]">
        <div className="max-w-5xl mx-auto py-5 px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 sm:self-auto">
              <div className="flex items-center gap-3">
                <Link
                  href={{ pathname: "/pro" }}
                  className="text-sm font-medium text-[--text-primary] hover:text-[--accent] transition-colors"
                >
                  Pro dashboard
                </Link>
                <SignedOut>
                  <SignInButton mode="redirect">
                    <button className="px-4 py-2 rounded-lg bg-[--accent] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <span className="text-[--text-tertiary] text-xs sm:text-right">
                  Powered by science-based training zones
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

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
