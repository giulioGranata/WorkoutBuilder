export type StepLike = {
  minutes: number;
  kind?: 'steady' | 'ramp';
  intensity?: number; // for steady
  from?: number; // for ramp
  to?: number; // for ramp
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function computeNP(steps: StepLike[], _ftp: number): number {
  if (!steps.length) return 0;
  const total = steps.reduce((sum, s) => sum + s.minutes, 0);
  if (total <= 0) return 0;
  const numerator = steps.reduce((acc, step) => {
    const kind = step.kind ?? 'steady';
    const watts = kind === 'ramp' ? ((step.from ?? 0) + (step.to ?? 0)) / 2 : step.intensity ?? 0;
    return acc + Math.pow(watts, 4) * step.minutes;
  }, 0);
  const np = Math.pow(numerator / total, 0.25);
  return Math.round(np);
}

export function computeTSS(totalMinutes: number, NP: number, ftp: number): number {
  if (ftp <= 0) return 0;
  const tss = (totalMinutes / 60) * Math.pow(NP / ftp, 2) * 100;
  return Math.round(clamp(tss, 0, Infinity));
}

