import { NextResponse } from "next/server";
import { db } from "@/db";
import { problems } from "@/db/schema";
import { recordLeetCodeSolves, syncCodeChefHandle } from "@/lib/sync";
import { getAutoSolvedProblemIds } from "@/lib/roadmap-solved";
import { isHandleVerified } from "@/lib/handle-verification";
import { getAuthenticatedUser } from "@/lib/supabase/dal";

export const dynamic = "force-dynamic";

// Called client-side (see AutoSolvedProvider) on every page that shows
// roadmap progress. Triggers a best-effort refresh of each platform's
// accumulated solved_problems rows, then returns which curated roadmap
// problems are now confirmed solved — but only for handles whose ownership
// has been verified (see lib/handle-verification.ts). The recording itself
// is gated too, not just the returned ids — otherwise typing in any
// stranger's public handle on the Topics/Contests pages would still
// silently store that stranger's solved-problem and rating data in our DB,
// verified or not.
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lc = searchParams.get("lc")?.trim() || "";
  const cc = searchParams.get("cc")?.trim() || "";

  if (!lc && !cc) {
    return NextResponse.json({ problemIds: [], verifiedLeetCode: false, verifiedCodeChef: false });
  }

  const [verifiedLeetCode, verifiedCodeChef] = await Promise.all([
    lc ? isHandleVerified(user.id, "leetcode", lc) : Promise.resolve(false),
    cc ? isHandleVerified(user.id, "codechef", cc) : Promise.resolve(false),
  ]);

  await Promise.all([
    verifiedLeetCode ? recordLeetCodeSolves(lc).catch(() => null) : Promise.resolve(null),
    verifiedCodeChef ? syncCodeChefHandle(cc).catch(() => null) : Promise.resolve(null),
  ]);

  const allProblems = await db
    .select({ id: problems.id, platform: problems.platform, externalRef: problems.externalRef, title: problems.title })
    .from(problems);

  const problemIds = await getAutoSolvedProblemIds(allProblems, {
    lc: verifiedLeetCode ? lc : undefined,
    cc: verifiedCodeChef ? cc : undefined,
  });

  return NextResponse.json({ problemIds: Array.from(problemIds), verifiedLeetCode, verifiedCodeChef });
}
