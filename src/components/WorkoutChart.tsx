import React, { useEffect, useMemo, useRef, useState } from "react";

export type StepLike = {
  minutes: number;
  intensity: number; // watts (bias already applied upstream)
  description: string;
  phase?: "warmup" | "cooldown" | "work" | "recovery";
};

interface Props {
  steps: StepLike[];
  ftp: number;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function colorForStep(step: StepLike, ftp: number) {
  if (step.phase === "warmup") return "var(--phase-warmup)";
  if (step.phase === "cooldown") return "var(--phase-cooldown)";

  if (ftp <= 0) return "var(--z1)";
  const pct = (step.intensity / ftp) * 100;
  if (pct <= 60) return "var(--z1)";
  if (pct <= 75) return "var(--z2)";
  if (pct <= 90) return "var(--z3)";
  if (pct <= 105) return "var(--z4)";
  return "var(--z5)";
}

export function WorkoutChart({ steps, ftp }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState<null | number>(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });

  // Resize observer for responsive tooltip positioning
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // initial read
    const initialRect = el.getBoundingClientRect();
    setContainerSize({ width: initialRect.width, height: initialRect.height });

    // Prefer ResizeObserver when available; jsdom in tests may not provide it
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        const rect = el.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    // Fallback: listen to window resize
    const onResize = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const totalMinutes = useMemo(
    () => steps.reduce((acc, s) => acc + (s.minutes || 0), 0),
    [steps]
  );

  const bars = useMemo(() => {
    // Constants for simple, consistent math
    const maxPerc = 1.6; // 160% FTP = full height
    const rampOuterFactor = 0.6; // outer side is a fraction of target height
    const gap = 0.6; // horizontal gap between bars, in % of total width

    // Precompute available width after gaps
    const count = steps.length;
    const gapsTotal = Math.max(0, count - 1) * gap;
    const available = Math.max(0, 100 - gapsTotal);

    // Helper: watts -> height% (0..100) relative to maxPerc*FTP
    const heightPct = (watts: number) => {
      if (ftp <= 0) return 0;
      const ratio = clamp(watts / ftp, 0, maxPerc) / maxPerc;
      return ratio * 100;
    };

    let xCursor = 0; // percentage of chart width
    const out: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      s: StepLike;
      shape: "rect" | "ramp-up" | "ramp-down";
      topY: number;
      yStart: number;
      yEnd: number;
    }> = [];

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const w = totalMinutes > 0 ? (s.minutes / totalMinutes) * available : 0;
      const innerH = heightPct(s.intensity); // biased intensity already applied upstream
      const outerH = innerH * rampOuterFactor;

      const x = xCursor;
      const shape: "rect" | "ramp-up" | "ramp-down" =
        s.phase === "warmup" ? "ramp-up" : s.phase === "cooldown" ? "ramp-down" : "rect";

      // Default rectangle metrics (work/recovery blocks)
      let h = innerH;
      let y = 100 - h;
      let yStart = 100 - innerH; // top at left
      let yEnd = 100 - innerH; // top at right

      if (shape === "ramp-up") {
        // Warmup: ramp from a fraction of target height to full target height
        yStart = 100 - outerH;
        yEnd = 100 - innerH;
      } else if (shape === "ramp-down") {
        // Cooldown: ramp from full target height down to its fraction
        yStart = 100 - innerH;
        yEnd = 100 - outerH;
      }

      const topY = Math.min(yStart, yEnd); // highest point for tooltip positioning
      out.push({ x, y, w, h, s, shape, topY, yStart, yEnd });

      // advance cursor; add gap after every bar except the last
      xCursor += w + (i < steps.length - 1 ? gap : 0);
    }

    return out;
  }, [steps, ftp, totalMinutes]);

  // Visual vertical padding inside the SVG drawing area (in % of viewBox)
  const vPad = 6; // equal top/bottom space to keep chart visually centered
  const scaleY = (100 - 2 * vPad) / 100;

  const updateTooltipForIndex = (index: number | null) => {
    if (index === null) return;
    const bar = bars[index];
    if (!bar || !containerRef.current) return;

    const { width, height } = containerSize;
    const centerX = (bar.x + bar.w / 2) / 100 * width;
    const tooltipEl = tooltipRef.current;
    const tooltipW = tooltipEl ? tooltipEl.offsetWidth : 140;
    const tooltipH = tooltipEl ? tooltipEl.offsetHeight : 36;

    const left = clamp(centerX - tooltipW / 2, 4, Math.max(4, width - tooltipW - 4));
    // Account for internal SVG vertical padding and scale to position tooltip correctly
    const barTopPct = vPad + ((bar.topY ?? bar.y) * scaleY);
    const barTop = (barTopPct / 100) * height; // px from top
    const top = clamp(barTop - tooltipH - 8, 4, Math.max(4, height - tooltipH - 4));
    setTooltipPos({ left, top });
  };

  useEffect(() => {
    if (active !== null) updateTooltipForIndex(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, containerSize.width, containerSize.height]);

  if (!steps || steps.length === 0 || totalMinutes === 0) {
    return (
      <div className="w-full h-40 sm:h-48 flex items-center justify-center text-[--text-tertiary]">
        No steps to display
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-40 sm:h-48 select-none py-4 sm:py-6"
    >
      <svg
        className="w-full h-full"
        role="img"
        aria-label="Workout chart"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Optional baseline */}
        <rect x={0} y={0} width={100} height={100} fill="transparent" />
        <g transform={`translate(0, ${vPad}) scale(1, ${scaleY})`}>
          {bars.map((bar, idx) => {
          const fill = colorForStep(bar.s, ftp);
          const isActive = active === idx;
          if (bar.shape === "rect") {
            return (
              <g key={idx}>
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={Math.max(0.001, bar.w)}
                  height={bar.h}
                  rx={2}
                  style={{ fill }}
                  stroke={isActive ? "var(--ring)" : "transparent"}
                  strokeWidth={isActive ? 1.5 : 0}
                  role="button"
                  tabIndex={0}
                  aria-label={`${bar.s.minutes}' • ${bar.s.intensity} W — ${bar.s.description}`}
                  onFocus={() => {
                    setActive(idx);
                    updateTooltipForIndex(idx);
                  }}
                  onBlur={() => setActive(null)}
                  onMouseEnter={() => {
                    setActive(idx);
                    updateTooltipForIndex(idx);
                  }}
                  onMouseLeave={() => setActive(null)}
                />
              </g>
            );
          }

          // Right-angled trapezoids for warmup/cooldown
          const x0 = bar.x;
          const x1 = bar.x + Math.max(0.001, bar.w);
          const yBase = 100; // bottom baseline
          // BL -> BR -> TR -> TL -> Z (top edge slanted)
          const d = `M ${x0} ${yBase} L ${x1} ${yBase} L ${x1} ${bar.yEnd} L ${x0} ${bar.yStart} Z`;
          return (
            <path
              key={idx}
              d={d}
              style={{ fill }}
              stroke={isActive ? "var(--ring)" : "transparent"}
              strokeWidth={isActive ? 1.5 : 0}
              role="button"
              tabIndex={0}
              aria-label={`${bar.s.minutes}' • ${bar.s.intensity} W — ${bar.s.description}`}
              onFocus={() => {
                setActive(idx);
                updateTooltipForIndex(idx);
              }}
              onBlur={() => setActive(null)}
              onMouseEnter={() => {
                setActive(idx);
                updateTooltipForIndex(idx);
              }}
              onMouseLeave={() => setActive(null)}
            />
          );
          })}
        </g>
      </svg>

      {active !== null && (
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-10 bg-[--card] text-[--text-primary] border border-[--border] shadow-sm rounded-md px-2 py-1 text-xs tabular-nums whitespace-nowrap"
          style={{ left: `${tooltipPos.left}px`, top: `${tooltipPos.top}px` }}
        >
          <div className="font-semibold">{`${steps[active].minutes}' • ${steps[active].intensity} W`}</div>
          <div className="text-[--text-secondary]">{steps[active].description}</div>
        </div>
      )}
    </div>
  );
}

export default WorkoutChart;
