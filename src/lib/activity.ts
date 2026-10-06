import type { DailyDelta } from "@/lib/sync";

export type ActivityDay = { date: string; leetcodeCount: number; codechefCount: number };

// Pulled out of the dashboard page component: Date.now() is an impure call,
// and the React compiler's purity rule only allows that outside render.
export function mergeActivity(
  leetcodeCalendar: Record<string, number>,
  codechefActivity: DailyDelta[],
): ActivityDay[] {
  const byDate = new Map<string, ActivityDay>();

  for (const [epochSeconds, count] of Object.entries(leetcodeCalendar)) {
    const date = new Date(Number(epochSeconds) * 1000).toISOString().slice(0, 10);
    const entry = byDate.get(date) ?? { date, leetcodeCount: 0, codechefCount: 0 };
    entry.leetcodeCount += count;
    byDate.set(date, entry);
  }
  for (const { date, count } of codechefActivity) {
    const entry = byDate.get(date) ?? { date, leetcodeCount: 0, codechefCount: 0 };
    entry.codechefCount += count;
    byDate.set(date, entry);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function summarizeLastYear(activity: ActivityDay[]) {
  const oneYearAgoStr = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const lastYear = activity.filter((d) => d.date >= oneYearAgoStr);
  return {
    totalSubmissions: lastYear.reduce((s, d) => s + d.leetcodeCount + d.codechefCount, 0),
    activeDays: lastYear.filter((d) => d.leetcodeCount + d.codechefCount > 0).length,
  };
}
