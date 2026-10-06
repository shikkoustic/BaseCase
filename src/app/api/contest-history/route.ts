import { NextResponse } from "next/server";
import * as leetcode from "@/lib/platforms/leetcode";
import * as codechef from "@/lib/platforms/codechef";
import { isHandleVerified } from "@/lib/handle-verification";
import { getAuthenticatedUser } from "@/lib/supabase/dal";

export const dynamic = "force-dynamic";

export type ContestHistoryResponse = {
  leetcode: {
    currentRating: number;
    attendedCount: number;
    globalRanking: number | null;
    totalParticipants: number | null;
    topPercentage: number | null;
    history: { contestName: string; startTime: number; rating: number }[];
  } | null;
  codechef: {
    stars: string | null;
    history: { contestName: string; startTime: number; rating: number }[];
  } | null;
  verifiedLeetCode: boolean;
  verifiedCodeChef: boolean;
};

// Same ownership gate as the roadmap's auto-tracking (see
// lib/handle-verification.ts) — a contest rating history is just as much
// "someone's tracked progress" as the roadmap checkmarks, so it only shows
// for handles whose ownership has actually been verified.
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lc = searchParams.get("lc")?.trim() || "";
  const cc = searchParams.get("cc")?.trim() || "";

  const [verifiedLeetCode, verifiedCodeChef] = await Promise.all([
    lc ? isHandleVerified(user.id, "leetcode", lc) : Promise.resolve(false),
    cc ? isHandleVerified(user.id, "codechef", cc) : Promise.resolve(false),
  ]);

  const [lcHistory, ccHistory, ccProfile] = await Promise.all([
    verifiedLeetCode ? leetcode.getContestRatingHistory(lc).catch(() => null) : Promise.resolve(null),
    verifiedCodeChef ? codechef.getRatingHistory(cc).catch(() => null) : Promise.resolve(null),
    verifiedCodeChef ? codechef.getProfile(cc).catch(() => null) : Promise.resolve(null),
  ]);

  const response: ContestHistoryResponse = {
    leetcode: lcHistory,
    codechef: ccHistory && ccHistory.length > 0 ? { stars: ccProfile?.stars ?? null, history: ccHistory } : null,
    verifiedLeetCode,
    verifiedCodeChef,
  };

  return NextResponse.json(response);
}
