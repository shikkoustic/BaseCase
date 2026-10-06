"use server";

import * as leetcode from "@/lib/platforms/leetcode";

// Hints only exist for LeetCode (CodeChef, a competitive-programming judge,
// has no equivalent built-in hints) — fetched on demand per-click, not
// pre-loaded for the whole page, since most rows never get expanded.
export async function fetchProblemHints(platform: "leetcode" | "codechef", externalRef: string) {
  if (platform !== "leetcode") return [];
  try {
    return await leetcode.getHints(externalRef);
  } catch {
    return [];
  }
}
