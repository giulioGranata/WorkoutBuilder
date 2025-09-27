import type { Step } from "@/lib/types";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Dispatch,
  FocusEventHandler,
  MutableRefObject,
  PointerEventHandler,
  SetStateAction,
} from "react";
import {
  computeWorkoutGeometry,
  heightPct,
  roundedTrapezoidPath,
} from "./workoutChartGeometry";
import type { BarGeom } from "./workoutChartGeometry";

interface Props {
  steps: Step[];
  ftp: number;
  showFtpLine?: boolean; // default true
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const CORNER_RADIUS = 2; // rounded corners radius for bars
const V_PAD = 6; // vertical padding inside SVG (percentage of viewBox height)

const isRampStep = (step: Step): step is Step & { from: number; to: number } =>
  "from" in step && "to" in step;

const isSteadyStep = (step: Step): step is Step & { intensity: number } =>
  "intensity" in step;

const formatWattsText = (step: Step): string => {
  if (isRampStep(step)) {
    return `ramp ${step.from}→${step.to} W`;
  }
  if (isSteadyStep(step)) {
    return `${step.intensity} W`;
  }
  return "";
};

const formatStepLabel = (step: Step): string => {
  const wattsText = formatWattsText(step);
  const minutes = step.minutes ?? 0;
  const wattsPart = wattsText ? ` • ${wattsText}` : "";
  const descriptionPart = step.description ? ` — ${step.description}` : "";
  return `${minutes}'${wattsPart}${descriptionPart}`;
};

type ActiveSource = "pointer" | "focus";
type ActiveState = { index: number; source: ActiveSource } | null;

type PointerIntent =
  | { kind: "hover"; pointerType: string }
  | { kind: "pointer"; pointerType: string; pointerId?: number }
  | null;

type InteractionHandlers = {
  onPointerEnter: PointerEventHandler<SVGGraphicsElement>;
  onPointerLeave: PointerEventHandler<SVGGraphicsElement>;
  onPointerDown: PointerEventHandler<SVGGraphicsElement>;
  onPointerUp: PointerEventHandler<SVGGraphicsElement>;
  onPointerCancel: PointerEventHandler<SVGGraphicsElement>;
  onFocus: FocusEventHandler<SVGGraphicsElement>;
  onBlur: FocusEventHandler<SVGGraphicsElement>;
};

type BarInteraction = {
  ariaLabel: string;
  interactionProps: InteractionHandlers;
};

interface UseBarInteractionsArgs {
  bars: BarGeom[];
  pointerIntentRef: MutableRefObject<PointerIntent>;
  setActive: Dispatch<SetStateAction<ActiveState>>;
  updateTooltipForIndex: (index: number | null) => void;
}

function useBarInteractions({
  bars,
  pointerIntentRef,
  setActive,
  updateTooltipForIndex,
}: UseBarInteractionsArgs): BarInteraction[] {
  return useMemo(() => {
    return bars.map((bar, index) => {
      const ariaLabel = formatStepLabel(bar.s);

      const activateFromPointer = () => {
        updateTooltipForIndex(index);
        setActive({ index, source: "pointer" });
      };

      const activateFromFocus = () => {
        updateTooltipForIndex(index);
        setActive({ index, source: "focus" });
      };

      const clearPointerActive = () => {
        pointerIntentRef.current = null;
        setActive((prev) =>
          prev && prev.source === "pointer" && prev.index === index
            ? null
            : prev
        );
      };

      const clearFocusActive = () => {
        setActive((prev) =>
          prev && prev.source === "focus" && prev.index === index ? null : prev
        );
      };

      const interactionProps: InteractionHandlers = {
        onPointerEnter: (event) => {
          pointerIntentRef.current = {
            kind: "hover",
            pointerType: event.pointerType,
          };
          activateFromPointer();
        },
        onPointerLeave: () => {
          clearPointerActive();
          updateTooltipForIndex(null);
        },
        onPointerDown: (event) => {
          pointerIntentRef.current = {
            kind: "pointer",
            pointerType: event.pointerType,
            pointerId: event.pointerId,
          };
          activateFromPointer();
        },
        onPointerUp: () => {
          pointerIntentRef.current = null;
        },
        onPointerCancel: () => {
          clearPointerActive();
          updateTooltipForIndex(null);
        },
        onFocus: () => {
          pointerIntentRef.current = null;
          activateFromFocus();
        },
        onBlur: () => {
          clearFocusActive();
          updateTooltipForIndex(null);
        },
      };

      return { ariaLabel, interactionProps };
    });
  }, [bars, pointerIntentRef, setActive, updateTooltipForIndex]);
}

export function colorForStep(step: Step, ftp: number) {
  if (step.phase === "warmup") return "var(--phase-warmup)";
  if (step.phase === "cooldown") return "var(--phase-cooldown)";

  if (ftp <= 0) return "var(--z1)";
  const kind = (step as any).kind ?? "steady";
  const watts =
    kind === "ramp"
      ? ((step as any).from + (step as any).to) / 2
      : (step as any).intensity;
  const pct = (watts / ftp) * 100;
  if (pct <= 60) return "var(--z1)";
  if (pct <= 75) return "var(--z2)";
  if (pct <= 90) return "var(--z3)";
  if (pct <= 110) return "var(--z4)";
  if (pct <= 120) return "var(--z5)";
  return "var(--z6)";
}

export function WorkoutChart({ steps, ftp, showFtpLine = true }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState<ActiveState>(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
  const pointerIntentRef = useRef<PointerIntent>(null);

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

  const { totalMinutes, bars } = useMemo(
    () => computeWorkoutGeometry(steps, ftp),
    [steps, ftp]
  );

  // Visual vertical padding inside the SVG drawing area (in % of viewBox)
  const vPad = V_PAD; // equal top/bottom space to keep chart visually centered
  const scaleY = (100 - 2 * V_PAD) / 100;
  // Position helpers (in px) for overlays aligned to SVG Y space
  const ftpYPx = useMemo(() => {
    if (!ftp || ftp <= 0) return null;
    // Y position (in chart viewBox units, before padding/scale) for FTP level
    const yFtpPct = 100 - heightPct(ftp, ftp); // same scale used for bars
    const innerPct = V_PAD + yFtpPct * scaleY; // account for vertical padding/scale
    return (innerPct / 100) * containerSize.height;
  }, [ftp, containerSize.height, scaleY]);

  const clampedFtpLabelTop = useMemo(() => {
    if (ftpYPx == null) return null;
    // Keep label within 10px from top/bottom
    const labelH = 20; // approx pill height
    return clamp(
      ftpYPx - 12,
      10,
      Math.max(10, containerSize.height - labelH - 10)
    );
  }, [ftpYPx, containerSize.height]);

  const updateTooltipForIndex = useCallback(
    (index: number | null) => {
      if (index === null) return;
      const bar = bars[index];
      if (!bar || !containerRef.current) return;

      const { width, height } = containerSize;
      const centerX = ((bar.x + bar.w / 2) / 100) * width;
      const tooltipEl = tooltipRef.current;
      const tooltipW = tooltipEl ? tooltipEl.offsetWidth : 140;
      const tooltipH = tooltipEl ? tooltipEl.offsetHeight : 36;

      const left = clamp(
        centerX - tooltipW / 2,
        4,
        Math.max(4, width - tooltipW - 4)
      );
      // Account for internal SVG vertical padding and scale to position tooltip correctly
      const barTopPct = vPad + (bar.topY ?? bar.y) * scaleY;
      const barTop = (barTopPct / 100) * height; // px from top
      const top = clamp(
        barTop - tooltipH - 8,
        4,
        Math.max(4, height - tooltipH - 4)
      );
      setTooltipPos({ left, top });
    },
    [bars, containerSize, scaleY, vPad]
  );

  const activeIndex = active?.index ?? null;

  useEffect(() => {
    if (activeIndex !== null) updateTooltipForIndex(activeIndex);
  }, [activeIndex, updateTooltipForIndex]);

  const barInteractions = useBarInteractions({
    bars,
    pointerIntentRef,
    setActive,
    updateTooltipForIndex,
  });

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
      className="relative w-full h-40 sm:h-48 select-none py-4 sm:py-6 mb-8"
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
            const isFocusActive =
              active?.index === idx && active.source === "focus";
            const interaction = barInteractions[idx]!;
            const { ariaLabel: label, interactionProps } = interaction;
            if (bar.shape === "rect") {
              return (
                <g key={idx}>
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={Math.max(0.001, bar.w)}
                    height={bar.h}
                    rx={CORNER_RADIUS}
                    style={{ fill, outline: "none" }}
                    stroke={isFocusActive ? "var(--ring)" : "transparent"}
                    strokeWidth={isFocusActive ? 1.5 : 0}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    {...interactionProps}
                  />
                </g>
              );
            }

            const x0 = bar.x;
            const x1 = bar.x + Math.max(0.001, bar.w);
            const yBase = 100; // bottom baseline
            const d = roundedTrapezoidPath(
              x0,
              x1,
              yBase,
              bar.yStart,
              bar.yEnd,
              CORNER_RADIUS
            );
            return (
              <path
                key={idx}
                d={d}
                style={{ fill, outline: "none" }}
                stroke={isFocusActive ? "var(--ring)" : "transparent"}
                strokeWidth={isFocusActive ? 1.5 : 0}
                role="button"
                tabIndex={0}
                aria-label={label}
                {...interactionProps}
              />
            );
          })}
          {showFtpLine && ftp > 0 && (
            <>
              {/* FTP reference line above bars */}
              <line
                x1={0}
                x2={100}
                y1={100 - heightPct(ftp, ftp)}
                y2={100 - heightPct(ftp, ftp)}
                stroke="var(--accent-soft)"
                strokeWidth={2}
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
                aria-label="FTP reference line"
              />
            </>
          )}
        </g>
      </svg>

      {/* Right-side pill label aligned with the FTP line */}
      {showFtpLine && ftp > 0 && clampedFtpLabelTop != null && (
        <div
          className="absolute left-0 z-10 rounded-md p-1 border text-[9px] tabular-nums"
          style={{
            top: `${clampedFtpLabelTop}px`,
            background: "transparent",
            color: "var(--text-secondary)",
            borderColor: "transparent",
          }}
        >
          {`FTP (${ftp}W)`}
        </div>
      )}

      {activeIndex !== null && (
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-10 bg-[--card] text-[--text-primary] border border-[--border] shadow-sm rounded-md px-2 py-1 text-xs tabular-nums whitespace-nowrap"
          role="tooltip"
          style={{ left: `${tooltipPos.left}px`, top: `${tooltipPos.top}px` }}
        >
          {(() => {
            const step = steps[activeIndex];
            const label = formatStepLabel(step);
            const wattsText = formatWattsText(step);
            const minutes = step.minutes ?? 0;
            const hasWatts = wattsText.length > 0;
            const description = step.description ?? "";
            return (
              <div data-step-label={label}>
                <span className="font-semibold">
                  {hasWatts ? `${minutes}' • ${wattsText}` : `${minutes}'`}
                </span>
                {description ? (
                  <span className="block font-normal text-[--text-secondary]">
                    {` — ${description}`}
                  </span>
                ) : null}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default WorkoutChart;
