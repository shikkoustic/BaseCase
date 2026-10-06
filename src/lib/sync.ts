import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { codechefSnapshots, solvedProblems } from "@/db/schema";
import * as codechef from "@/lib/platforms/codechef";
import * as leetcode from "@/lib/platforms/leetcode";
import { normalizeCodeChefTitle } from "@/lib/roadmap-solved";

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

const SOLVED_CONFLICT_TARGET = [solvedProblems.handle, solvedProblems.platform, solvedProblems.externalRef];

// LeetCode's public API only exposes the most recent 20 accepted
// submissions (verified against the live endpoint — passing a higher limit
// doesn't return more), so this can't backfill older solves. It just adds
// whatever's newly visible on each call; combined with the fact it's called
// on every dashboard visit, it converges toward complete coverage over time
// rather than being instant. Older solves need the manual checkbox.
export async function recordLeetCodeSolves(username: string) {
  const recent = await leetcode.getRecentAcceptedSubmissions(username, 20);
  if (recent.length === 0) return;

  await db
    .insert(solvedProblems)
    .values(
      recent.map((s) => ({
        handle: username,
        platform: "leetcode" as const,
        externalRef: s.titleSlug,
        firstSeenAt: toDateString(new Date()),
      })),
    )
    .onConflictDoNothing({ target: SOLVED_CONFLICT_TARGET });
}

export type DailyDelta = { date: string; count: number };

// CodeChef exposes no per-day history, so we snapshot today's total-solved
// count for this handle and diff it against the most recent prior snapshot
// to get "today's" delta. First-ever snapshot for a handle records a
// baseline with 0 delta — there is no way to backfill history before that.
export async function syncCodeChefHandle(username: string) {
  const profile = await codechef.getProfile(username);
  if (!profile) return null;

  const today = toDateString(new Date());

  const [existingToday] = await db
    .select()
    .from(codechefSnapshots)
    .where(and(eq(codechefSnapshots.username, username), eq(codechefSnapshots.date, today)));

  // Already snapshotted today — don't re-diff against ourselves.
  if (!existingToday) {
    await db
      .insert(codechefSnapshots)
      .values({ username, date: today, rating: profile.rating, totalSolved: profile.totalSolved })
      .onConflictDoUpdate({
        target: [codechefSnapshots.username, codechefSnapshots.date],
        set: { rating: profile.rating, totalSolved: profile.totalSolved },
      });
  }

  if (profile.solvedProblemNames.length > 0) {
    await db
      .insert(solvedProblems)
      .values(
        profile.solvedProblemNames.map((name) => ({
          handle: username,
          platform: "codechef" as const,
          externalRef: normalizeCodeChefTitle(name),
          firstSeenAt: today,
        })),
      )
      .onConflictDoNothing({ target: SOLVED_CONFLICT_TARGET });
  }

  return profile;
}

// Diffs consecutive daily snapshots into a sparse day->count delta list for
// the activity heatmap. Gaps between visits just mean no CodeChef signal for
// those days, which is the honest trade-off of not having real history.
export async function getCodeChefActivity(username: string): Promise<DailyDelta[]> {
  const snapshots = await db
    .select()
    .from(codechefSnapshots)
    .where(eq(codechefSnapshots.username, username))
    .orderBy(codechefSnapshots.date);

  const deltas: DailyDelta[] = [];
  for (let i = 1; i < snapshots.length; i++) {
    const count = Math.max(0, snapshots[i].totalSolved - snapshots[i - 1].totalSolved);
    if (count > 0) deltas.push({ date: snapshots[i].date, count });
  }
  return deltas;
}

// Refreshes every handle anyone has ever looked up, so CodeChef tracking
// stays accurate day-to-day even if that person doesn't revisit — triggered
// by the daily cron (see app/api/cron/sync/route.ts).
export async function syncAllKnownCodeChefHandles() {
  const rows = await db
    .selectDistinct({ username: codechefSnapshots.username })
    .from(codechefSnapshots);

  const results = await Promise.allSettled(rows.map((r) => syncCodeChefHandle(r.username)));
  return {
    total: rows.length,
    failed: results.filter((r) => r.status === "rejected").length,
  };
}
