import { db } from "@/db";
import { problems, topics } from "@/db/schema";
import { syncCodeChefHandle, getCodeChefActivity } from "@/lib/sync";
import { mergeActivity, summarizeLastYear } from "@/lib/activity";
import * as leetcode from "@/lib/platforms/leetcode";
import { isHandleVerified } from "@/lib/handle-verification";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { HandleForm } from "@/components/handle-form";
import { RoadmapProgress } from "@/components/roadmap-progress";
import { RoadmapStat } from "@/components/roadmap-stat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoSolvedProvider } from "@/contexts/auto-solved";
import { HandleVerificationCard } from "@/components/handle-verification-card";
import { RecentSubmissions } from "@/components/recent-submissions";
import { requireUser } from "@/lib/supabase/dal";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser();
  const params = await searchParams;
  const lc = typeof params.lc === "string" ? params.lc.trim() : "";
  const cc = typeof params.cc === "string" ? params.cc.trim() : "";

  const allTopics = await db.select().from(topics).orderBy(topics.orderIndex);
  const allProblems = await db
    .select({ id: problems.id, topicId: problems.topicId })
    .from(problems);
  const topicsWithProblems = allTopics.map((t) => ({
    id: t.id,
    name: t.name,
    problemIds: allProblems.filter((p) => p.topicId === t.id).map((p) => p.id),
  }));

  if (!lc && !cc) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold text-center">Your tracker</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Type your LeetCode and/or CodeChef username to link it to your
          account. Once verified, only you can see this handle&apos;s data —
          we remember it in this browser for next time.
        </p>
        <div className="mt-6">
          <HandleForm initialLc="" initialCc="" />
        </div>
      </div>
    );
  }

  const [verifiedLeetCode, verifiedCodeChef] = await Promise.all([
    lc ? isHandleVerified(user.id, "leetcode", lc) : Promise.resolve(false),
    cc ? isHandleVerified(user.id, "codechef", cc) : Promise.resolve(false),
  ]);

  const [leetcodeStats, leetcodeCalendar, codechefProfile] = await Promise.all([
    verifiedLeetCode ? leetcode.getSolvedStats(lc).catch(() => null) : Promise.resolve(null),
    verifiedLeetCode
      ? Promise.all(
          [new Date().getFullYear() - 1, new Date().getFullYear()].map((y) =>
            leetcode.getSubmissionCalendar(lc, y).catch(() => ({})),
          ),
        ).then((cals) => Object.assign({}, ...cals) as Record<string, number>)
      : Promise.resolve({} as Record<string, number>),
    verifiedCodeChef ? syncCodeChefHandle(cc).catch(() => null) : Promise.resolve(null),
  ]);

  const codechefActivity = verifiedCodeChef ? await getCodeChefActivity(cc).catch(() => []) : [];

  const activity = mergeActivity(leetcodeCalendar, codechefActivity);
  const { totalSubmissions: totalThisYear, activeDays } = summarizeLastYear(activity);

  const allProblemIds = allProblems.map((p) => p.id);
  const anyVerified = verifiedLeetCode || verifiedCodeChef;
  const anyUnverified = (Boolean(lc) && !verifiedLeetCode) || (Boolean(cc) && !verifiedCodeChef);
  const recentActivityOptions = [
    ...(verifiedLeetCode ? [{ platform: "leetcode" as const, handle: lc }] : []),
    ...(verifiedCodeChef ? [{ platform: "codechef" as const, handle: cc }] : []),
  ];

  return (
    <AutoSolvedProvider initialHandles={{ lc: lc || undefined, cc: cc || undefined }}>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {lc || cc ? `${lc || "—"} / ${cc || "—"}` : "Your dashboard"}
          </h1>
          <HandleForm initialLc={lc} initialCc={cc} compact />
        </div>

        {anyUnverified && (
          <div className="mt-6">
            <HandleVerificationCard lc={lc || undefined} cc={cc || undefined} />
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Active days (last year)" value={activeDays} />
          <StatCard label="Submissions tracked (last year)" value={totalThisYear} />
          <RoadmapStat allProblemIds={allProblemIds} />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {anyVerified ? (
              <>
                <ActivityHeatmap data={activity} />
                {verifiedCodeChef && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    CodeChef activity is tracked from the first time this handle was
                    looked up here — CodeChef doesn&apos;t publish day-by-day history.
                  </p>
                )}
              </>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Verify a handle above to see its activity here.
              </p>
            )}
          </CardContent>
        </Card>

        {(verifiedLeetCode || verifiedCodeChef) && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {verifiedLeetCode && leetcodeStats && (
              <Card className={verifiedCodeChef && codechefProfile ? "" : "sm:col-span-2"}>
                <CardHeader>
                  <CardTitle className="text-base">LeetCode — {lc}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="Easy" value={leetcodeStats.easy} difficulty="easy" />
                  <Stat label="Medium" value={leetcodeStats.medium} difficulty="medium" />
                  <Stat label="Hard" value={leetcodeStats.hard} difficulty="hard" />
                </CardContent>
              </Card>
            )}

            {verifiedCodeChef && codechefProfile && (
              <Card className={verifiedLeetCode && leetcodeStats ? "" : "sm:col-span-2"}>
                <CardHeader>
                  <CardTitle className="text-base">CodeChef — {cc}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 text-center">
                  <Stat label="Rating" value={codechefProfile.rating ?? 0} />
                  <Stat label="Problems solved" value={codechefProfile.totalSolved} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className={recentActivityOptions.length > 0 ? "" : "sm:col-span-2"}>
            <CardHeader>
              <CardTitle className="text-base">Roadmap progress</CardTitle>
            </CardHeader>
            <CardContent>
              <RoadmapProgress topics={topicsWithProblems} />
            </CardContent>
          </Card>

          {recentActivityOptions.length > 0 && (
            <RecentSubmissions options={recentActivityOptions} />
          )}
        </div>
      </div>
    </AutoSolvedProvider>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// LeetCode's own difficulty colors (matched exactly, not the app's usual
// emerald/amber/rose, so this reads at a glance the same way LeetCode's own
// profile stats do).
const DIFFICULTY_RING_COLOR: Record<string, string> = {
  easy: "#00af9b",
  medium: "#ffb800",
  hard: "#ff2d55",
};

function Stat({
  label,
  value,
  difficulty,
}: {
  label: string;
  value: number;
  difficulty?: "easy" | "medium" | "hard";
}) {
  if (!difficulty) {
    return (
      <div>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    );
  }

  const color = DIFFICULTY_RING_COLOR[difficulty];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex size-14 items-center justify-center rounded-full border-2 text-base font-semibold"
        style={{ borderColor: color, color }}
      >
        {value}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
