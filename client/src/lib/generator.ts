import { WorkoutType, Difficulty, Step, Workout, WorkoutFormData } from './types';

export function generateWorkout({ ftp, durationMin, type, difficulty = "standard" }: WorkoutFormData): Workout {
  // Apply difficulty modifiers
  const difficultyModifier = difficulty === "easy" ? -5 : difficulty === "hard" ? 5 : 0;
  const adjustedFtp = ftp + (ftp * difficultyModifier / 100);
  
  // Calculate warm-up and cool-down durations
  const warmupDuration = Math.max(5, Math.min(12, Math.floor(durationMin * 0.1)));
  const cooldownDuration = Math.max(5, Math.min(8, Math.floor(durationMin * 0.1)));
  const availableWorkTime = durationMin - warmupDuration - cooldownDuration;
  
  const steps: Step[] = [];
  
  // Add warm-up
  steps.push({
    minutes: warmupDuration,
    intensityPct: Math.round(adjustedFtp * 0.6),
    description: "Easy warm-up pace to prepare for main efforts",
    phase: "warmup"
  });
  
  // Generate core workout based on type
  let workSteps: Step[] = [];
  let remainingTime = availableWorkTime;
  
  switch (type) {
    case "recovery":
      workSteps = generateRecoverySteps(adjustedFtp, remainingTime);
      break;
    case "endurance":
      workSteps = generateEnduranceSteps(adjustedFtp, remainingTime, difficulty);
      break;
    case "tempo":
      workSteps = generateTempoSteps(adjustedFtp, remainingTime, difficulty);
      break;
    case "threshold":
      workSteps = generateThresholdSteps(adjustedFtp, remainingTime, difficulty);
      break;
    case "vo2max":
      workSteps = generateVO2MaxSteps(adjustedFtp, remainingTime, difficulty);
      break;
    case "anaerobic":
      workSteps = generateAnaerobicSteps(adjustedFtp, remainingTime, difficulty);
      break;
  }
  
  // Check if we need to truncate
  const totalWorkTime = workSteps.reduce((sum, step) => sum + step.minutes, 0);
  if (totalWorkTime > remainingTime) {
    workSteps = truncateWorkSteps(workSteps, remainingTime);
  }
  
  steps.push(...workSteps);
  
  // Add cool-down
  steps.push({
    minutes: cooldownDuration,
    intensityPct: Math.round(adjustedFtp * 0.5),
    description: "Easy cool-down to aid recovery",
    phase: "cooldown"
  });
  
  const totalMinutes = steps.reduce((sum, step) => sum + step.minutes, 0);
  const workMinutes = workSteps.filter(step => step.phase === "work").reduce((sum, step) => sum + step.minutes, 0);
  const recoveryMinutes = workSteps.filter(step => step.phase === "recovery").reduce((sum, step) => sum + step.minutes, 0);
  const avgIntensity = Math.round(
    steps.reduce((sum, step) => sum + (step.intensityPct * step.minutes), 0) / totalMinutes
  );
  
  // Format title with proper capitalization
  const typeTitle = type === "vo2max" ? "VO2max" : type.charAt(0).toUpperCase() + type.slice(1);
  
  return {
    title: `${typeTitle} — ${durationMin}'`,
    steps,
    totalMinutes,
    workMinutes,
    recoveryMinutes,
    avgIntensity
  };
}

function generateRecoverySteps(ftp: number, duration: number): Step[] {
  return [{
    minutes: duration,
    intensityPct: Math.round(ftp * 0.55),
    description: "Continuous easy pace for active recovery",
    phase: "work"
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
      description: "Steady aerobic pace for base building",
      phase: "work"
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
      description: `Tempo effort ${intervalCount} - moderately hard sustainable pace`,
      phase: "work"
    });
    remaining -= workDuration;
    
    if (remaining > restDuration) {
      steps.push({
        minutes: restDuration,
        intensityPct: restIntensity,
        description: "Easy recovery between tempo efforts",
        phase: "recovery"
      });
      remaining -= restDuration;
    }
    intervalCount++;
  }
  
  if (remaining > 0) {
    steps.push({
      minutes: remaining,
      intensityPct: intensity,
      description: `Final tempo effort - maintain steady power`,
      phase: "work"
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
      description: `Threshold effort ${intervalCount} - sustainable but challenging`,
      phase: "work"
    });
    remaining -= workDuration;
    
    if (remaining > restDuration) {
      steps.push({
        minutes: restDuration,
        intensityPct: restIntensity,
        description: "Easy recovery between threshold efforts",
        phase: "recovery"
      });
      remaining -= restDuration;
    }
    intervalCount++;
  }
  
  if (remaining > 0) {
    steps.push({
      minutes: remaining,
      intensityPct: intensity,
      description: `Final threshold effort - push through fatigue`,
      phase: "work"
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
      description: `VO2max interval ${intervalCount} - high intensity effort`,
      phase: "work"
    });
    remaining -= workDuration;
    
    if (remaining > restDuration) {
      steps.push({
        minutes: restDuration,
        intensityPct: restIntensity,
        description: "Recovery between VO2max intervals",
        phase: "recovery"
      });
      remaining -= restDuration;
    }
    intervalCount++;
  }
  
  return steps;
}

function generateAnaerobicSteps(ftp: number, duration: number, difficulty: Difficulty): Step[] {
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
      description: `Anaerobic effort ${intervalCount} - very high intensity`,
      phase: "work"
    });
    remaining -= workDuration;
    
    if (remaining > restDuration) {
      steps.push({
        minutes: restDuration,
        intensityPct: restIntensity,
        description: "Recovery between anaerobic efforts",
        phase: "recovery"
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
