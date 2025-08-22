import { WorkoutType, Difficulty, Step, Workout } from './types';

interface WorkoutParams {
  ftp: number;
  durationMin: number;
  type: WorkoutType;
  difficulty?: Difficulty;
}

export function generateWorkout({ ftp, durationMin, type, difficulty = "standard" }: WorkoutParams): Workout {
  // Apply difficulty modifiers
  const difficultyModifier = difficulty === "easy" ? -5 : difficulty === "hard" ? 5 : 0;
  const adjustedFtp = ftp + (ftp * difficultyModifier / 100);
  
  // Calculate warm-up and cool-down durations (min 5, max 12 for warmup; min 5, max 8 for cooldown)
  const warmupDuration = Math.max(5, Math.min(12, Math.floor(durationMin * 0.1)));
  const cooldownDuration = Math.max(5, Math.min(8, Math.floor(durationMin * 0.1)));
  const availableWorkTime = durationMin - warmupDuration - cooldownDuration;
  
  const steps: Step[] = [];
  
  // Add warm-up (≈60% FTP)
  steps.push({
    minutes: warmupDuration,
    intensityPct: Math.round(adjustedFtp * 0.6),
    description: `${warmupDuration}' — ${Math.round(adjustedFtp * 0.6)}% FTP — Easy warm-up pace to prepare for main efforts`
  });
  
  // Generate core workout based on type
  let workSteps: Step[] = [];
  
  switch (type) {
    case "recovery":
      workSteps = generateRecoverySteps(adjustedFtp, availableWorkTime);
      break;
    case "endurance":
      workSteps = generateEnduranceSteps(adjustedFtp, availableWorkTime, difficulty);
      break;
    case "tempo":
      workSteps = generateTempoSteps(adjustedFtp, availableWorkTime, difficulty);
      break;
    case "threshold":
      workSteps = generateThresholdSteps(adjustedFtp, availableWorkTime, difficulty);
      break;
    case "vo2max":
      workSteps = generateVO2MaxSteps(adjustedFtp, availableWorkTime, difficulty);
      break;
    case "anaerobic":
      workSteps = generateAnaerobicSteps(adjustedFtp, availableWorkTime, difficulty);
      break;
  }
  
  // Check if we need to truncate
  const totalWorkTime = workSteps.reduce((sum, step) => sum + step.minutes, 0);
  if (totalWorkTime > availableWorkTime) {
    workSteps = truncateWorkSteps(workSteps, availableWorkTime);
  }
  
  steps.push(...workSteps);
  
  // Add cool-down (≈50% FTP)
  steps.push({
    minutes: cooldownDuration,
    intensityPct: Math.round(adjustedFtp * 0.5),
    description: `${cooldownDuration}' — ${Math.round(adjustedFtp * 0.5)}% FTP — Easy cool-down to aid recovery`
  });
  
  const totalMinutes = steps.reduce((sum, step) => sum + step.minutes, 0);
  
  // Format title with proper capitalization
  const typeTitle = type === "vo2max" ? "VO2max" : type.charAt(0).toUpperCase() + type.slice(1);
  
  return {
    title: `${typeTitle} — ${durationMin}'`,
    steps,
    totalMinutes
  };
}

function generateRecoverySteps(ftp: number, duration: number): Step[] {
  const intensity = Math.round(ftp * 0.55);
  return [{
    minutes: duration,
    intensityPct: intensity,
    description: `${duration}' — ${intensity}% FTP — Continuous easy pace for active recovery`
  }];
}

function generateEnduranceSteps(ftp: number, duration: number, difficulty: Difficulty): Step[] {
  const steps: Step[] = [];
  const chunkDuration = difficulty === "easy" ? 8 : difficulty === "hard" ? 12 : 10;
  const intensity = Math.round(ftp * 0.7);
  
  let remaining = duration;
  while (remaining > 0) {
    const stepDuration = Math.min(chunkDuration, remaining);
    steps.push({
      minutes: stepDuration,
      intensityPct: intensity,
      description: `${stepDuration}' — ${intensity}% FTP — Steady aerobic pace for base building`
    });
    remaining -= stepDuration;
  }
  
  return steps;
}

function generateTempoSteps(ftp: number, duration: number, difficulty: Difficulty): Step[] {
  const steps: Step[] = [];
  const workDuration = difficulty === "easy" ? 8 : difficulty === "hard" ? 12 : 10;
  const restDuration = difficulty === "easy" ? 3 : difficulty === "hard" ? 2 : 3;
  const intensity = Math.round(ftp * 0.83);
  const restIntensity = Math.round(ftp * 0.55);
  
  let remaining = duration;
  let intervalCount = 1;
  
  while (remaining > workDuration) {
    steps.push({
      minutes: workDuration,
      intensityPct: intensity,
      description: `${workDuration}' — ${intensity}% FTP — Tempo effort ${intervalCount} - moderately hard sustainable pace`
    });
    remaining -= workDuration;
    
    if (remaining > restDuration) {
      steps.push({
        minutes: restDuration,
        intensityPct: restIntensity,
        description: `${restDuration}' — ${restIntensity}% FTP — Easy recovery between tempo efforts`
      });
      remaining -= restDuration;
    }
    intervalCount++;
  }
  
  if (remaining > 0) {
    const intensity = Math.round(ftp * 0.83);
    steps.push({
      minutes: remaining,
      intensityPct: intensity,
      description: `${remaining}' — ${intensity}% FTP — Final tempo effort - maintain steady power`
    });
  }
  
  return steps;
}

function generateThresholdSteps(ftp: number, duration: number, difficulty: Difficulty): Step[] {
  const steps: Step[] = [];
  const workDuration = difficulty === "easy" ? 6 : difficulty === "hard" ? 10 : 8;
  const restDuration = difficulty === "easy" ? 5 : difficulty === "hard" ? 3 : 4;
  const intensity = Math.round(ftp * 1.0);
  const restIntensity = Math.round(ftp * 0.55);
  
  let remaining = duration;
  let intervalCount = 1;
  
  while (remaining > workDuration) {
    steps.push({
      minutes: workDuration,
      intensityPct: intensity,
      description: `${workDuration}' — ${intensity}% FTP — Threshold effort ${intervalCount} - sustainable but challenging`
    });
    remaining -= workDuration;
    
    if (remaining > restDuration) {
      steps.push({
        minutes: restDuration,
        intensityPct: restIntensity,
        description: `${restDuration}' — ${restIntensity}% FTP — Easy recovery between threshold efforts`
      });
      remaining -= restDuration;
    }
    intervalCount++;
  }
  
  if (remaining > 0) {
    steps.push({
      minutes: remaining,
      intensityPct: intensity,
      description: `${remaining}' — ${intensity}% FTP — Final threshold effort - push through fatigue`
    });
  }
  
  return steps;
}

function generateVO2MaxSteps(ftp: number, duration: number, difficulty: Difficulty): Step[] {
  const steps: Step[] = [];
  const workDuration = difficulty === "easy" ? 2 : difficulty === "hard" ? 4 : 3;
  const restDuration = workDuration; // Equal rest
  const intensity = Math.round(ftp * 1.15);
  const restIntensity = Math.round(ftp * 0.55);
  
  let remaining = duration;
  let intervalCount = 1;
  
  while (remaining > workDuration) {
    steps.push({
      minutes: workDuration,
      intensityPct: intensity,
      description: `${workDuration}' — ${intensity}% FTP — VO2max interval ${intervalCount} - high intensity effort`
    });
    remaining -= workDuration;
    
    if (remaining > restDuration) {
      steps.push({
        minutes: restDuration,
        intensityPct: restIntensity,
        description: `${restDuration}' — ${restIntensity}% FTP — Recovery between VO2max intervals`
      });
      remaining -= restDuration;
    }
    intervalCount++;
  }
  
  return steps;
}

function generateAnaerobicSteps(ftp: number, duration: number, _difficulty: Difficulty): Step[] {
  const steps: Step[] = [];
  const workDuration = 1; // 1 minute for MVP (keeping integers)
  const restDuration = 2;
  const intensity = Math.round(ftp * 1.35);
  const restIntensity = Math.round(ftp * 0.55);
  
  let remaining = duration;
  let intervalCount = 1;
  
  while (remaining > workDuration) {
    steps.push({
      minutes: workDuration,
      intensityPct: intensity,
      description: `${workDuration}' — ${intensity}% FTP — Anaerobic effort ${intervalCount} - very high intensity`
    });
    remaining -= workDuration;
    
    if (remaining > restDuration) {
      steps.push({
        minutes: restDuration,
        intensityPct: restIntensity,
        description: `${restDuration}' — ${restIntensity}% FTP — Recovery between anaerobic efforts`
      });
      remaining -= restDuration;
    }
    intervalCount++;
  }
  
  return steps;
}

function truncateWorkSteps(steps: Step[], maxDuration: number): Step[] {
  const truncatedSteps: Step[] = [];
  let currentDuration = 0;
  
  for (const step of steps) {
    if (currentDuration + step.minutes <= maxDuration) {
      truncatedSteps.push(step);
      currentDuration += step.minutes;
    } else {
      const remainingTime = maxDuration - currentDuration;
      if (remainingTime > 0) {
        truncatedSteps.push({
          ...step,
          minutes: remainingTime,
          description: step.description + " (truncated)"
        });
      }
      break;
    }
  }
  
  return truncatedSteps;
}