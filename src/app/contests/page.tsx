import * as leetcode from "@/lib/platforms/leetcode";
import * as codechef from "@/lib/platforms/codechef";
import { buildUnifiedContests, type UnifiedContest } from "@/lib/contests";
import { PLATFORM_CLASS } from "@/lib/difficulty";
import { PlatformIcon } from "@/components/platform-icon";
import { ContestHistorySection } from "@/components/contest-history-section";
import { ArrowUpRight } from "lucide-react";

export const revalidate = 300; // contest lists don't need to be live-live

export default async function ContestsPage() {
  const [lcContests, ccContests] = await Promise.all([
    leetcode.getContests().catch(() => []),
    codechef.getContests().catch(() => []),
  ]);

  const upcoming = buildUnifiedContests(lcContests, ccContests).filter((c) => c.isUpcoming);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Contests</h1>
        <p className="mt-2 text-muted-foreground">
          Every upcoming rated round from LeetCode and CodeChef, merged into one list.
        </p>

        <div className="mt-8 divide-y divide-border rounded-lg border border-border">
          {upcoming.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No upcoming contests found right now.
            </p>
          )}
          {upcoming.map((c) => (
            <ContestRow key={c.url} contest={c} />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <ContestHistorySection />
      </div>
    </div>
  );
}

function ContestRow({ contest }: { contest: UnifiedContest }) {
  const date = new Date(contest.startTime);

  return (
    <a
      href={contest.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-md border border-border py-1.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {date.toLocaleDateString(undefined, { month: "short" })}
        </span>
        <span className="text-lg font-semibold leading-none">{date.getDate()}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{contest.name}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          <PlatformIcon platform={contest.platform} className="size-3" />
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${PLATFORM_CLASS[contest.platform]}`}
      >
        {contest.relativeLabel}
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}
