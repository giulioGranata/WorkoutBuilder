import { RampStep, SteadyStep, Step } from "./types";

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const applyBias = (watts: number, biasPct: number) =>
  Math.max(0, Math.round(watts * (biasPct / 100)));

export const isRampStep = (step: Step): step is RampStep =>
  "from" in step && "to" in step;

export const toSteadyStep = (step: Step): SteadyStep => step as SteadyStep;

export const applyBiasToStep = (step: Step, biasPct: number): Step => {
  if (isRampStep(step)) {
    const { from, to, ...rest } = step;
    return {
      ...rest,
      kind: "ramp",
      from: applyBias(from, biasPct),
      to: applyBias(to, biasPct),
    } satisfies Step;
  }

  const { intensity, ...rest } = toSteadyStep(step);
  return {
    ...rest,
    kind: "steady",
    intensity: applyBias(intensity, biasPct),
  } satisfies Step;
};

export const getStepAverageWatts = (step: Step) => {
  if (isRampStep(step)) {
    return (step.from + step.to) / 2;
  }
  return toSteadyStep(step).intensity;
};

export const getStepBounds = (step: Step): [number, number] => {
  if (isRampStep(step)) {
    const lower = Math.min(step.from, step.to);
    const upper = Math.max(step.from, step.to);
    return [lower, upper];
  }
  const intensity = toSteadyStep(step).intensity;
  return [intensity, intensity];
};

export const sumStepMinutes = (steps: Step[]) =>
  steps.reduce((total, step) => total + step.minutes, 0);
