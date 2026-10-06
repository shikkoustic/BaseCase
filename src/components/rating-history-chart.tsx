"use client";

import { useRef, useState } from "react";

type Point = { contestName: string; startTime: number; rating: number };

const WIDTH = 600;
const HEIGHT = 210;
const PAD_LEFT = 42;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

// A single-series line chart (no legend needed — the panel header already
// names the series) with a hover crosshair + tooltip, per the house chart
// method: thin 2px line, recessive gridlines, a highlighted end point.
export function RatingHistoryChart({ data, color }: { data: Point[]; color: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const minTime = data[0].startTime;
  const maxTime = data[data.length - 1].startTime;
  const timeSpan = Math.max(1, maxTime - minTime);

  const ratings = data.map((d) => d.rating);
  const minRatingRaw = Math.min(...ratings);
  const maxRatingRaw = Math.max(...ratings);
  const ratingPad = Math.max(20, (maxRatingRaw - minRatingRaw) * 0.15);
  const minRating = minRatingRaw - ratingPad;
  const maxRating = maxRatingRaw + ratingPad;
  const ratingSpan = Math.max(1, maxRating - minRating);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (t: number) => PAD_LEFT + ((t - minTime) / timeSpan) * plotWidth;
  const y = (r: number) => PAD_TOP + plotHeight - ((r - minRating) / ratingSpan) * plotHeight;

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.startTime).toFixed(1)},${y(d.rating).toFixed(1)}`).join(" ");

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    data.forEach((d, i) => {
      const dist = Math.abs(x(d.startTime) - svgX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const last = data[data.length - 1];

  // Keep the tooltip box from running off either edge of the viewBox.
  const tooltipWidth = 150;
  const tooltipX = hovered
    ? Math.min(Math.max(x(hovered.startTime) - tooltipWidth / 2, PAD_LEFT), WIDTH - PAD_RIGHT - tooltipWidth)
    : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIndex(null)}
    >
      {[0, 0.5, 1].map((frac) => {
        const gy = PAD_TOP + plotHeight * frac;
        const rating = Math.round(maxRating - ratingSpan * frac);
        return (
          <g key={frac}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={gy}
              y2={gy}
              className="stroke-foreground/[0.06]"
              strokeWidth={1}
            />
            <text x={PAD_LEFT - 6} y={gy + 3} textAnchor="end" className="fill-muted-foreground/70 text-[10px] font-mono">
              {rating}
            </text>
          </g>
        );
      })}

      <text x={PAD_LEFT} y={HEIGHT - 8} className="fill-muted-foreground/70 text-[10px]">
        {new Date(minTime).toLocaleDateString(undefined, { month: "short", year: "2-digit" })}
      </text>
      <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 8} textAnchor="end" className="fill-muted-foreground/70 text-[10px]">
        {new Date(maxTime).toLocaleDateString(undefined, { month: "short", year: "2-digit" })}
      </text>

      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last.startTime)} cy={y(last.rating)} r={3.5} fill={color} />

      {hovered && (
        <g>
          <line
            x1={x(hovered.startTime)}
            x2={x(hovered.startTime)}
            y1={PAD_TOP}
            y2={PAD_TOP + plotHeight}
            className="stroke-foreground/20"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
          <circle cx={x(hovered.startTime)} cy={y(hovered.rating)} r={4} fill={color} stroke="var(--background)" strokeWidth={1.5} />

          <g transform={`translate(${tooltipX}, ${PAD_TOP})`}>
            <rect width={tooltipWidth} height={34} rx={6} className="fill-popover stroke-foreground/10" strokeWidth={1} />
            <text x={8} y={14} className="fill-foreground text-[11px] font-medium">
              {hovered.contestName.length > 24 ? `${hovered.contestName.slice(0, 22)}…` : hovered.contestName}
            </text>
            <text x={8} y={26} className="fill-muted-foreground font-mono text-[10px]">
              {new Date(hovered.startTime).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
              {" · "}
              {hovered.rating}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
