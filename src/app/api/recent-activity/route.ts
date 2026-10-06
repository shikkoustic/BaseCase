import { NextResponse } from "next/server";
import * as leetcode from "@/lib/platforms/leetcode";
import * as codechef from "@/lib/platforms/codechef";
import { problemUrl } from "@/lib/platforms/urls";
import { isHandleVerified } from "@/lib/handle-verification";
import { getAuthenticatedUser } from "@/lib/supabase/dal";

export const dynamic = "force-dynamic";

export type RecentActivityItem = {
  title: string;
  url: string | null;
  timestamp: number | null;
  // "accepted" | "wrong answer" | "partially accepted" | etc — LeetCode's
  // public API only exposes accepted submissions, so this is always
  // "accepted" there; CodeChef's own Recent Activity feed shows every
  // attempt, so this can be a cross just as often as a tick.
  result: string;
  score: string | null;
};

export type RecentActivityResponse = {
  items: RecentActivityItem[];
};

function parsePlatform(value: string | null): "leetcode" | "codechef" | null {
  return value === "leetcode" || value === "codechef" ? value : null;
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const platform = parsePlatform(searchParams.get("platform"));
  const handle = searchParams.get("handle")?.trim();

  if (!platform || !handle) {
    return NextResponse.json({ error: "platform and handle are required" }, { status: 400 });
  }

  // Same ownership gate as everywhere else this app shows "your" activity —
  // see lib/handle-verification.ts.
  const verified = await isHandleVerified(user.id, platform, handle);
  if (!verified) {
    return NextResponse.json({ items: [] } satisfies RecentActivityResponse);
  }

  if (platform === "leetcode") {
    const submissions = await leetcode.getRecentAcceptedSubmissions(handle, 20).catch(() => []);
    const response: RecentActivityResponse = {
      items: submissions.map((s) => ({
        title: s.title,
        url: problemUrl("leetcode", s.titleSlug),
        timestamp: s.timestamp * 1000,
        result: "accepted",
        score: null,
      })),
    };
    return NextResponse.json(response);
  }

  // CodeChef's own "Recent Activity" table — real timestamps, real problem
  // links, and every attempt (not just accepted), matching what CodeChef
  // itself shows on the profile page.
  const submissions = await codechef.getRecentActivity(handle, 20).catch(() => []);
  const response: RecentActivityResponse = {
    items: submissions.map((s) => ({
      title: s.problemCode,
      url: s.url,
      timestamp: s.timestamp,
      result: s.result,
      score: s.score,
    })),
  };
  return NextResponse.json(response);
}
