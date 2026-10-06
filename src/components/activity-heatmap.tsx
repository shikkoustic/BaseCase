"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

// Each calendar month is its own independent mini-grid (day 1 starts at
// whatever row its weekday falls on, in column 0), not a single continuous
// week-grid with month labels marking transitions. A shared week-grid means
// a week straddling a month boundary mixes both months in one column —
// that's what LeetCode's own calendar avoids, and why this matches it
// instead of reusing a generic "GitHub-style" heatmap library.

const LEVEL_COLORS = {
  light: ["#ebedf0", "#c6e6c6", "#7fcf7f", "#3fae3f", "#1f7a1f"],
  dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
};

const CELL = 12; // block size
const MARGIN = 4; // gap between cells within a month
const PITCH = CELL + MARGIN;
const MONTH_GAP = 10; // extra gap between one month's block and the next's
const LABEL_HEIGHT = 16;

function levelFor(count: number) {
  if (count <= 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function tooltipText(date: string, count: number): string {
  const label = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (count <= 0) return `No submissions on ${label}`;
  return `${count} submission${count === 1 ? "" : "s"} on ${label}`;
}

type Cell = { date: string; count: number; col: number; row: number };
type MonthBlock = { key: string; label: string; x: number; cols: number; cells: Cell[] };

export function ActivityHeatmap({
  data,
}: {
  data: { date: string; leetcodeCount: number; codechefCount: number }[];
}) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const scrollRef = useRef<HTMLDivElement>(null);

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of data) map.set(d.date, d.leetcodeCount + d.codechefCount);
    return map;
  }, [data]);

  const { months, totalWidth } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const firstDateStr = [...countByDate.keys(), todayStr].sort()[0] ?? todayStr;
    const firstDate = new Date(`${firstDateStr}T00:00:00`);

    const months: MonthBlock[] = [];
    let cursor = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    let x = 0;

    while (cursor <= today) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDow = new Date(year, month, 1).getDay(); // 0 = Sunday
      const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
      const lastDay = isCurrentMonth ? today.getDate() : daysInMonth;

      const cells: Cell[] = [];
      for (let day = 1; day <= lastDay; day++) {
        const idx = firstDow + (day - 1);
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        cells.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0, col: Math.floor(idx / 7), row: idx % 7 });
      }
      const cols = Math.floor((firstDow + lastDay - 1) / 7) + 1;

      if (months.length > 0) x += MONTH_GAP;
      months.push({ key: `${year}-${month}`, label: cursor.toLocaleString(undefined, { month: "short" }), x, cols, cells });
      x += cols * PITCH;

      cursor = new Date(year, month + 1, 1);
    }

    return { months, totalWidth: x - MARGIN };
  }, [countByDate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth });
  }, [data]);

  const colors = LEVEL_COLORS[mounted && resolvedTheme === "light" ? "light" : "dark"];

  return (
    <div ref={scrollRef} className="overflow-x-auto pb-1">
      <svg
        width={totalWidth}
        height={LABEL_HEIGHT + 7 * PITCH - MARGIN}
        className="overflow-visible"
        style={{ fontSize: 11 }}
      >
        {months.map((m) => (
          <text
            key={m.key}
            x={m.x + (m.cols * PITCH - MARGIN) / 2}
            y={LABEL_HEIGHT - 5}
            textAnchor="middle"
            className="fill-muted-foreground"
          >
            {m.label}
          </text>
        ))}
        {months.map((m) =>
          m.cells.map((cell) => (
            <rect
              key={cell.date}
              x={m.x + cell.col * PITCH}
              y={LABEL_HEIGHT + cell.row * PITCH}
              width={CELL}
              height={CELL}
              rx={2}
              fill={colors[levelFor(cell.count)]}
            >
              <title>{tooltipText(cell.date, cell.count)}</title>
            </rect>
          )),
        )}
      </svg>
    </div>
  );
}
