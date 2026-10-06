import { PlatformIcon } from "@/components/platform-icon";
import { RatingHistoryChart } from "@/components/rating-history-chart";
import { computeContestInsights, type ContestPoint } from "@/lib/contest-insights";

const PLATFORM_LINE_COLOR: Record<"leetcode" | "codechef", string> = {
  leetcode: "#f97316", // tailwind orange-500 — matches the platform's color elsewhere in the app
  codechef: "#0ea5e9", // tailwind sky-500 — CodeChef's own brown is unreadable on dark bg
};

function DeltaLabel({ value, suffix = "" }: { value: number; suffix?: string }) {
  const sign = value > 0 ? "+" : value < 0 ? "" : "±";
  const colorClass =
    value > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : value < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-muted-foreground";
  return (
    <span className={`font-mono font-medium ${colorClass}`}>
      {sign}
      {value}
      {suffix}
    </span>
  );
}

export function ContestHistoryPanel({
  platform,
  handle,
  history,
  globalRanking,
  totalParticipants,
  topPercentage,
  stars,
}: {
  platform: "leetcode" | "codechef";
  handle: string;
  history: ContestPoint[];
  globalRanking?: number | null;
  totalParticipants?: number | null;
  topPercentage?: number | null;
  stars?: string | null;
}) {
  const insights = computeContestInsights(history);
  if (!insights) return null;

  return (
    <div className="rounded-lg border border-foreground/[0.06] bg-foreground/[0.015] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <PlatformIcon platform={platform} className="size-4" />
          <span className="font-medium">{handle}</span>
          {stars && (
            <span className="rounded border border-foreground/[0.06] bg-foreground/[0.03] px-1.5 py-0.5 text-xs text-muted-foreground">
              {stars}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold leading-none">{insights.currentRating}</p>
          <p className="text-xs text-muted-foreground">
            current rating
            {topPercentage != null && ` · top ${topPercentage.toFixed(1)}%`}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <RatingHistoryChart data={history} color={PLATFORM_LINE_COLOR[platform]} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span>
          Since first contest: <DeltaLabel value={insights.deltaSinceStart} />
        </span>
        {insights.last3Delta !== null && history.length > 3 && (
          <span>
            Last 3 contests: <DeltaLabel value={insights.last3Delta} />
          </span>
        )}
        <span>
          Peak: <span className="font-mono font-medium text-foreground">{insights.peakRating}</span>
        </span>
        {globalRanking != null && totalParticipants != null && (
          <span>
            Global rank:{" "}
            <span className="font-mono font-medium text-foreground">
              {globalRanking.toLocaleString()} / {totalParticipants.toLocaleString()}
            </span>
          </span>
        )}
      </div>

      {(insights.bestContest || insights.worstContest) && (
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          {insights.bestContest && (
            <span>
              Best jump: <span className="text-foreground">{insights.bestContest.contestName}</span>{" "}
              <DeltaLabel value={insights.bestContest.delta} />
            </span>
          )}
          {insights.worstContest && insights.worstContest.delta < 0 && (
            <span>
              Worst drop: <span className="text-foreground">{insights.worstContest.contestName}</span>{" "}
              <DeltaLabel value={insights.worstContest.delta} />
            </span>
          )}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-md border border-foreground/[0.06]">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-auto" />
            <col className="w-20" />
            <col className="w-16" />
            <col className="w-16" />
          </colgroup>
          <thead>
            <tr className="border-b border-foreground/[0.06] text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-normal">Contest</th>
              <th className="px-3 py-2 font-normal">Date</th>
              <th className="px-3 py-2 text-right font-normal">Rating</th>
              <th className="px-3 py-2 text-right font-normal">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/[0.06]">
            {insights.recent.map((c) => (
              <tr key={`${c.contestName}-${c.startTime}`}>
                <td className="truncate px-3 py-2">{c.contestName}</td>
                <td className="truncate px-3 py-2 text-muted-foreground">
                  {new Date(c.startTime).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </td>
                <td className="px-3 py-2 text-right font-mono">{c.rating}</td>
                <td className="px-3 py-2 text-right">
                  <DeltaLabel value={c.delta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
