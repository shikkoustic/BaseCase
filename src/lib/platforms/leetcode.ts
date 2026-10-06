// LeetCode's unofficial-but-public GraphQL endpoint. No API key; used read-only
// and lightly (per-user, on dashboard load / daily cron), same as every public
// "LeetCode stats" tool.
const ENDPOINT = "https://leetcode.com/graphql";

async function query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`LeetCode GraphQL request failed: ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`LeetCode GraphQL error: ${json.errors[0]?.message ?? "unknown"}`);
  }
  return json.data as T;
}

// The public "Summary" bio on a LeetCode profile — used as a handle-ownership
// check: a visitor proves they control the account by pasting a one-time
// code in here, which we read back through this same public field.
export async function getAboutMe(username: string): Promise<string | null> {
  const data = await query<{ matchedUser: { profile: { aboutMe: string } } | null }>(
    `query getUserProfile($username: String!) {
      matchedUser(username: $username) { profile { aboutMe } }
    }`,
    { username },
  );
  return data.matchedUser?.profile.aboutMe ?? null;
}

export type LeetCodeSolvedStats = {
  easy: number;
  medium: number;
  hard: number;
  total: number;
};

export async function getSolvedStats(username: string): Promise<LeetCodeSolvedStats | null> {
  const data = await query<{
    matchedUser: {
      submitStatsGlobal: { acSubmissionNum: { difficulty: string; count: number }[] };
    } | null;
  }>(
    `query userProblemsSolved($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal { acSubmissionNum { difficulty count } }
      }
    }`,
    { username },
  );

  if (!data.matchedUser) return null;

  const byDifficulty = Object.fromEntries(
    data.matchedUser.submitStatsGlobal.acSubmissionNum.map((d) => [d.difficulty, d.count]),
  );

  return {
    easy: byDifficulty.Easy ?? 0,
    medium: byDifficulty.Medium ?? 0,
    hard: byDifficulty.Hard ?? 0,
    total: byDifficulty.All ?? 0,
  };
}

// day -> submission count (all submissions, not just accepted — LeetCode
// doesn't expose an accepted-only calendar publicly).
export async function getSubmissionCalendar(
  username: string,
  year: number,
): Promise<Record<string, number>> {
  const data = await query<{
    matchedUser: { userCalendar: { submissionCalendar: string } } | null;
  }>(
    `query userProfileCalendar($username: String!, $year: Int) {
      matchedUser(username: $username) {
        userCalendar(year: $year) { submissionCalendar }
      }
    }`,
    { username, year },
  );

  if (!data.matchedUser) return {};
  return JSON.parse(data.matchedUser.userCalendar.submissionCalendar) as Record<string, number>;
}

export type LeetCodeRecentSubmission = {
  title: string;
  titleSlug: string;
  timestamp: number;
};

export async function getRecentAcceptedSubmissions(
  username: string,
  limit = 15,
): Promise<LeetCodeRecentSubmission[]> {
  const data = await query<{
    recentAcSubmissionList: { title: string; titleSlug: string; timestamp: string }[];
  }>(
    `query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title titleSlug timestamp
      }
    }`,
    { username, limit },
  );

  return data.recentAcSubmissionList.map((s) => ({
    ...s,
    timestamp: Number(s.timestamp),
  }));
}

export type LeetCodeContest = {
  title: string;
  titleSlug: string;
  startTime: number;
  duration: number;
};

export async function getContests(): Promise<LeetCodeContest[]> {
  const data = await query<{ allContests: LeetCodeContest[] }>(
    `query { allContests { title titleSlug startTime duration } }`,
    {},
  );
  return data.allContests;
}

export type ContestRatingPoint = {
  contestName: string;
  startTime: number; // epoch ms
  rating: number;
  ranking: number;
  problemsSolved: number;
  totalProblems: number;
};

export type LeetCodeContestHistory = {
  currentRating: number;
  attendedCount: number;
  globalRanking: number | null;
  totalParticipants: number | null;
  topPercentage: number | null;
  // Ascending by time — oldest contest first.
  history: ContestRatingPoint[];
};

// Public and unauthenticated (verified against the live endpoint) — the same
// per-contest rating history leetcode's own contest-ranking page reads from.
export async function getContestRatingHistory(username: string): Promise<LeetCodeContestHistory | null> {
  const data = await query<{
    userContestRanking: {
      attendedContestsCount: number;
      rating: number;
      globalRanking: number | null;
      totalParticipants: number | null;
      topPercentage: number | null;
    } | null;
    userContestRankingHistory: {
      attended: boolean;
      rating: number;
      ranking: number;
      problemsSolved: number;
      totalProblems: number;
      contest: { title: string; startTime: number } | null;
    }[];
  }>(
    `query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount rating globalRanking totalParticipants topPercentage
      }
      userContestRankingHistory(username: $username) {
        attended rating ranking problemsSolved totalProblems
        contest { title startTime }
      }
    }`,
    { username },
  );

  if (!data.userContestRanking) return null;

  const history = data.userContestRankingHistory
    .filter((c) => c.attended && c.contest)
    .map((c) => ({
      contestName: c.contest!.title,
      startTime: c.contest!.startTime * 1000,
      rating: Math.round(c.rating),
      ranking: c.ranking,
      problemsSolved: c.problemsSolved,
      totalProblems: c.totalProblems,
    }))
    .sort((a, b) => a.startTime - b.startTime);

  return {
    currentRating: Math.round(data.userContestRanking.rating),
    attendedCount: data.userContestRanking.attendedContestsCount,
    globalRanking: data.userContestRanking.globalRanking,
    totalParticipants: data.userContestRanking.totalParticipants,
    topPercentage: data.userContestRanking.topPercentage,
    history,
  };
}

export type LeetCodeProblem = {
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topicTags: { name: string; slug: string }[];
};

// Used only by the seed script to help pick well-tagged problems per topic —
// not called on every request.
export async function getProblemsByTag(
  tagSlug: string,
  limit = 50,
): Promise<LeetCodeProblem[]> {
  const data = await query<{
    problemsetQuestionList: { questions: LeetCodeProblem[] };
  }>(
    `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
        questions: data { title titleSlug difficulty topicTags { name slug } }
      }
    }`,
    { categorySlug: "", skip: 0, limit, filters: { tags: [tagSlug] } },
  );
  return data.problemsetQuestionList.questions;
}

// LeetCode's own official progressive hints for a problem — real, written by
// LeetCode, not generated. Only some problems have them; returns [] if none.
// Hints come back as HTML (e.g. "<code>x</code>"); stripped to plain text
// since we only ever render them as plain strings.
export async function getHints(titleSlug: string): Promise<string[]> {
  const data = await query<{ question: { hints: string[] } | null }>(
    `query questionHints($titleSlug: String!) { question(titleSlug: $titleSlug) { hints } }`,
    { titleSlug },
  );
  return (data.question?.hints ?? []).map((h) => h.replace(/<[^>]+>/g, ""));
}
