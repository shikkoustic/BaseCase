import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { solvedProblems } from "@/db/schema";

// CodeChef's public page gives us problem names, not codes, so title is the
// only key we can match a curated problem against — normalized the same way
// on both sides (seed data and scraped name) to absorb casing/whitespace drift.
export function normalizeCodeChefTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export type RoadmapProblemRef = {
  id: string;
  platform: "leetcode" | "codechef";
  externalRef: string;
  title: string;
};

// Cross-references accumulated solved_problems rows (see schema.ts) against
// the curated roadmap problems for the given handles, returning the subset
// of problem ids confirmed solved on the handle's actual LeetCode/CodeChef
// activity — not just what's been manually checked off.
export async function getAutoSolvedProblemIds(
  allProblems: RoadmapProblemRef[],
  handles: { lc?: string; cc?: string },
): Promise<Set<string>> {
  const handleList = [handles.lc, handles.cc].filter((h): h is string => Boolean(h));
  if (handleList.length === 0) return new Set();

  const rows = await db
    .select({ handle: solvedProblems.handle, platform: solvedProblems.platform, externalRef: solvedProblems.externalRef })
    .from(solvedProblems)
    .where(inArray(solvedProblems.handle, handleList));

  const solvedLeetCodeSlugs = new Set(
    rows.filter((r) => r.platform === "leetcode").map((r) => r.externalRef),
  );
  const solvedCodeChefTitles = new Set(
    rows.filter((r) => r.platform === "codechef").map((r) => r.externalRef),
  );

  const result = new Set<string>();
  for (const p of allProblems) {
    if (p.platform === "leetcode" && solvedLeetCodeSlugs.has(p.externalRef)) {
      result.add(p.id);
    } else if (p.platform === "codechef" && solvedCodeChefTitles.has(normalizeCodeChefTitle(p.title))) {
      result.add(p.id);
    }
  }
  return result;
}
