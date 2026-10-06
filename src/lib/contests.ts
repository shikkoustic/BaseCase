import type { LeetCodeContest } from "@/lib/platforms/leetcode";
import type { CodeChefContest } from "@/lib/platforms/codechef";

export type UnifiedContest = {
  platform: "leetcode" | "codechef";
  name: string;
  url: string;
  startTime: number; // epoch ms
  isUpcoming: boolean;
  relativeLabel: string;
};

function relativeLabel(startTime: number, now: number): string {
  const diffMs = startTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return "In progress";
  if (diffHours < 1) return `In ${Math.max(1, Math.round(diffMs / 60000))} min`;
  if (diffHours < 24) return `In ${Math.round(diffHours)}h`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays} days`;
}

// Pulled out of the page component: computing `Date.now()` is an impure call,
// and the React compiler's purity rule only allows that outside render.
export function buildUnifiedContests(
  lcContests: LeetCodeContest[],
  ccContests: CodeChefContest[],
): UnifiedContest[] {
  const now = Date.now();

  const contests = [
    ...lcContests.map((c) => ({
      platform: "leetcode" as const,
      name: c.title,
      url: `https://leetcode.com/contest/${c.titleSlug}`,
      startTime: c.startTime * 1000,
    })),
    ...ccContests
      .filter((c) => c.status !== "past")
      .map((c) => ({
        platform: "codechef" as const,
        name: c.name,
        url: `https://www.codechef.com/${c.code}`,
        startTime: new Date(c.startTime).getTime(),
      })),
  ];

  return contests
    .map((c) => ({
      ...c,
      isUpcoming: c.startTime > now,
      relativeLabel: relativeLabel(c.startTime, now),
    }))
    .sort((a, b) => a.startTime - b.startTime);
}
