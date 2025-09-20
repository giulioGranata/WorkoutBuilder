import type { Step } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  steps: Step[];
  ftp: number;
  showFtpLine?: boolean; // default true
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// Visual/geometry constants
const MAX_PERC = 1.6; // 160% FTP = full height
const GAP_PCT = 0.6; // horizontal gap between bars (percentage of total width)
const CORNER_RADIUS = 2; // rounded corners radius for bars
const V_PAD = 6; // vertical padding inside SVG (percentage of viewBox height)

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

type BarShape = "rect" | "trapezoid";
type BarGeom = {
  x: number;
  y: number;
  w: number;
  h: number;
  s: Step;
  shape: BarShape;
  topY: number;
  yStart: number;
  yEnd: number;
};

const heightPct = (watts: number, ftp: number): number => {
  if (ftp <= 0) return 0;
  const ratio = clamp(watts / ftp, 0, MAX_PERC) / MAX_PERC;
  return ratio * 100;
};

// Build a rounded right-angled trapezoid path.
// Corners order (clockwise): BL -> BR -> TR -> TL.
function roundedTrapezoidPath(
  x0: number,
  x1: number,
  yBase: number,
  yStart: number, // top-left Y
  yEnd: number, // top-right Y
  rBase: number = 2
): string {
  const w = Math.max(0, x1 - x0);
  if (w === 0) return `M ${x0} ${yBase} Z`;

  // Top edge vector and length
  const dx = x1 - x0;
  const dy = yEnd - yStart;
  const L = Math.hypot(dx, dy);

  // Limit radius so it fits all sides
  const hl = Math.max(0, yBase - yStart);
  const hr = Math.max(0, yBase - yEnd);
  const r = Math.max(
    0,
    Math.min(rBase, w / 2, hl / 2, hr / 2, L > 0 ? L / 2 : rBase)
  );
  if (r === 0) {
    // Sharp path fallback
    return `M ${x0} ${yBase} L ${x1} ${yBase} L ${x1} ${yEnd} L ${x0} ${yStart} Z`;
  }

  if (L === 0) {
    // Degenerate to a rounded rectangle (top is flat)
    const yTop = yStart;
    return [
      `M ${x0 + r} ${yBase}`,
      `L ${x1 - r} ${yBase}`,
      `Q ${x1} ${yBase} ${x1} ${yBase - r}`,
      `L ${x1} ${yTop + r}`,
      `Q ${x1} ${yTop} ${x1 - r} ${yTop}`,
      `L ${x0 + r} ${yTop}`,
      `Q ${x0} ${yTop} ${x0} ${yTop + r}`,
      `L ${x0} ${yBase - r}`,
      `Q ${x0} ${yBase} ${x0 + r} ${yBase}`,
      "Z",
    ].join(" ");
  }

  const t = r / L; // param along the top edge for rounding
  const pTLx = x0 + dx * t;
  const pTLy = yStart + dy * t;
  const pTRx = x0 + dx * (1 - t);
  const pTRy = yStart + dy * (1 - t);

  // Build path clockwise with 4 rounded corners
  return [
    // bottom edge to just before BR corner
    `M ${x0 + r} ${yBase}`,
    `L ${x1 - r} ${yBase}`,
    // round BR
    `Q ${x1} ${yBase} ${x1} ${yBase - r}`,
    // right edge up to just before TR corner
    `L ${x1} ${yEnd + r}`,
    // round TR to top edge point
    `Q ${x1} ${yEnd} ${pTRx} ${pTRy}`,
    // along top edge to just after TL corner
    `L ${pTLx} ${pTLy}`,
    // round TL
    `Q ${x0} ${yStart} ${x0} ${yStart + r}`,
    // left edge down to just before BL corner
    `L ${x0} ${yBase - r}`,
    // round BL back to start
    `Q ${x0} ${yBase} ${x0 + r} ${yBase}`,
    "Z",
  ].join(" ");
}

export function WorkoutChart({ steps, ftp, showFtpLine = true }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  type ActiveState = { index: number; source: "pointer" | "focus" } | null;
  const [active, setActive] = useState<ActiveState>(null);
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

  const bars = useMemo<BarGeom[]>(() => {
    // Precompute available width after gaps
    const count = steps.length;
    const gapsTotal = Math.max(0, count - 1) * GAP_PCT;
    const available = Math.max(0, 100 - gapsTotal);

    let xCursor = 0; // percentage of chart width
    const out: BarGeom[] = [];

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const w = totalMinutes > 0 ? (s.minutes / totalMinutes) * available : 0;
      const kind = (s as any).kind ?? "steady";

      let h = 0;
      let y = 0;
      let yStart = 0;
      let yEnd = 0;
      let shape: BarShape = "rect";

      if (kind === "ramp") {
        const fromH = heightPct((s as any).from, ftp);
        const toH = heightPct((s as any).to, ftp);
        h = Math.max(fromH, toH);
        y = 100 - h;
        yStart = 100 - fromH;
        yEnd = 100 - toH;
        shape = "trapezoid";
      } else {
        const intH = heightPct((s as any).intensity, ftp);
        h = intH;
        y = 100 - h;
        yStart = 100 - intH;
        yEnd = 100 - intH;
        shape = "rect";
      }

      const topY = Math.min(yStart, yEnd); // highest point for tooltip positioning
      out.push({ x: xCursor, y, w, h, s, shape, topY, yStart, yEnd });

      // advance cursor; add gap after every bar except the last
      xCursor += w + (i < steps.length - 1 ? GAP_PCT : 0);
    }

    return out;
  }, [steps, ftp, totalMinutes]);

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

  const updateTooltipForIndex = (index: number | null) => {
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
  };

  const activeIndex = active?.index ?? null;

  useEffect(() => {
    if (activeIndex !== null) updateTooltipForIndex(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, containerSize.width, containerSize.height]);

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
            const activatePointer = () => {
              setActive({ index: idx, source: "pointer" });
              updateTooltipForIndex(idx);
            };
            const activateFocus = () => {
              setActive({ index: idx, source: "focus" });
              updateTooltipForIndex(idx);
            };
            const clear = () => setActive((prev) =>
              prev?.index === idx ? null : prev
            );
            const isFocusActive =
              active?.index === idx && active.source === "focus";
            const kind = (bar.s as any).kind ?? "steady";
            const wattsText =
              kind === "ramp"
                ? `ramp ${(bar.s as any).from}→${(bar.s as any).to} W`
                : `${(bar.s as any).intensity} W`;
            const label = `${bar.s.minutes}' • ${wattsText} — ${bar.s.description}`;
            if (bar.shape === "rect") {
              return (
                <g key={idx}>
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={Math.max(0.001, bar.w)}
                    height={bar.h}
                    rx={CORNER_RADIUS}
                    style={{ fill }}
                    stroke={isFocusActive ? "var(--ring)" : "transparent"}
                    strokeWidth={isFocusActive ? 1.5 : 0}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    onFocus={activateFocus}
                    onBlur={clear}
                    onMouseEnter={activatePointer}
                    onMouseLeave={clear}
                    onTouchStart={activatePointer}
                    onTouchEnd={clear}
                    onPointerLeave={clear}
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
                style={{ fill }}
                stroke={isFocusActive ? "var(--ring)" : "transparent"}
                strokeWidth={isFocusActive ? 1.5 : 0}
                role="button"
                tabIndex={0}
                aria-label={label}
                onFocus={activateFocus}
                onBlur={clear}
                onMouseEnter={activatePointer}
                onMouseLeave={clear}
                onTouchStart={activatePointer}
                onTouchEnd={clear}
                onPointerLeave={clear}
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
          style={{ left: `${tooltipPos.left}px`, top: `${tooltipPos.top}px` }}
        >
          {(() => {
            const step = steps[activeIndex];
            const kind = (step as any).kind ?? "steady";
            const wattsText =
              kind === "ramp"
                ? `ramp ${(step as any).from}→${(step as any).to} W`
                : `${(step as any).intensity} W`;
            return (
              <>
                <div className="font-semibold">{`${step.minutes}' • ${wattsText}`}</div>
                <div className="text-[--text-secondary]">
                  {step.description}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default WorkoutChart;
