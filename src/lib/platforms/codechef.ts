import * as cheerio from "cheerio";

// CodeChef has no official public API. These two endpoints were verified by
// hand to be genuinely public (no auth, no key):
//  - the contests list, a documented-by-usage JSON endpoint
//  - the user profile page, which is still server-rendered HTML (not an SPA)
// The per-user *submission* status pages (codechef.com/status/...) return 403
// even with a browser user-agent — there is no public per-day activity feed,
// which is why CodeChef's heatmap contribution is tracked forward only (see
// the cron job), not backfilled.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export type CodeChefProfile = {
  rating: number | null;
  stars: string | null;
  totalSolved: number;
  // Names, not codes — CodeChef's public profile page never exposes problem
  // codes, only the display name per solved problem. Used to match against
  // the roadmap's curated CodeChef problems by (normalized) title.
  solvedProblemNames: string[];
};

export async function getProfile(handle: string): Promise<CodeChefProfile | null> {
  const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, {
    headers: { "User-Agent": UA },
    next: { revalidate: 0 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CodeChef profile request failed: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const ratingText = $(".rating-number").first().text().trim();
  const rating = ratingText ? parseInt(ratingText, 10) : null;

  const stars = $(".rating").first().text().trim() || null;

  // The "Problems solved" section's per-contest breakdown only covers rated
  // contests (e.g. "Starters 224") — practice-mode solves (most of a typical
  // profile) never show up there, so counting those names undercounts badly.
  // CodeChef's own page states the real total directly: an unlabeled
  // "Total Problems Solved: N" heading in the same section.
  const totalSolvedText = $(".problems-solved")
    .find("h3")
    .filter((_, el) => /Total Problems Solved/.test($(el).text()))
    .first()
    .text();
  const totalSolvedMatch = totalSolvedText.match(/(\d+)/);
  const totalSolved = totalSolvedMatch ? parseInt(totalSolvedMatch[1], 10) : 0;

  // Still collected for the (contest-only) name-based roadmap matching —
  // see roadmap-solved.ts — just no longer used as the headline count.
  const problemNames = new Set<string>();
  $(".problems-solved .content p span span").each((_, el) => {
    const text = $(el).text().trim();
    if (text) problemNames.add(text);
  });

  return {
    rating: Number.isFinite(rating) ? rating : null,
    stars,
    totalSolved,
    solvedProblemNames: Array.from(problemNames),
  };
}

// The public display Name on a CodeChef profile (the "Edit Profile" → Name
// field) — used the same way as LeetCode's Readme: a visitor proves handle
// ownership by pasting a one-time code in here. CodeChef has no free-text
// bio field, so this is the one editable, publicly-visible field available.
export async function getName(handle: string): Promise<string | null> {
  const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, {
    headers: { "User-Agent": UA },
    next: { revalidate: 0 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CodeChef profile request failed: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const name = $(".user-details-container h1.h2-style").first().text().trim();
  return name || null;
}

export type CodeChefSubmission = {
  problemCode: string;
  url: string;
  // CodeChef's own verdict string: "accepted", "wrong answer", "partially
  // accepted", "time limit exceeded", etc. — shown as a tick or cross to
  // match CodeChef's own UI (its Recent Activity table shows every
  // submission, not just accepted ones, unlike LeetCode's public API).
  result: string;
  score: string | null;
  language: string;
  timestamp: number | null;
  solutionUrl: string | null;
};

// CodeChef's profile page has a genuine "Recent Activity" table — initially
// missed because it's paginated via a separate endpoint, not present in the
// first page's static HTML. `/recent/user` is the same endpoint the page's
// own pagination arrows call (verified against the live site); it needs no
// auth and returns clean JSON with a page's table HTML. page=0 is the
// newest batch (confirmed against the live, JS-hydrated page) — page=1 is
// already the *next* (older) page, not the first; starting the loop there
// was silently skipping the most recent activity.
export async function getRecentActivity(handle: string, limit = 20): Promise<CodeChefSubmission[]> {
  const items: CodeChefSubmission[] = [];
  const pagesNeeded = Math.ceil(limit / 12);

  for (let page = 0; page < pagesNeeded; page++) {
    const res = await fetch(
      `https://www.codechef.com/recent/user?page=${page}&user_handle=${encodeURIComponent(handle)}`,
      { headers: { "User-Agent": UA }, next: { revalidate: 0 } },
    );
    if (!res.ok) break;

    const json = (await res.json()) as { content?: string };
    if (!json.content) break;

    const $ = cheerio.load(json.content);
    const rows = $("table.dataTable tbody tr");
    if (rows.length === 0) break;

    rows.each((_, el) => {
      const tds = $(el).find("td");
      const problemLink = tds.eq(1).find("a");
      const problemCode = problemLink.text().trim();
      const href = problemLink.attr("href");
      if (!problemCode || !href) return;

      const timeText = tds.eq(0).find(".tooltiptext").text().trim();
      const resultSpan = tds.eq(2).find("span[title]").first();
      const scoreText = resultSpan.find("span").first().text().trim();
      const solutionHref = tds.eq(4).find("a").attr("href");

      items.push({
        problemCode,
        url: `https://www.codechef.com${href}`,
        result: resultSpan.attr("title") ?? "unknown",
        score: scoreText || null,
        language: tds.eq(3).text().trim(),
        timestamp: parseCodeChefTimestamp(timeText),
        solutionUrl: solutionHref ? `https://www.codechef.com${solutionHref}` : null,
      });
    });

    if (rows.length < 12) break; // last page
  }

  return items.slice(0, limit);
}

// CodeChef renders submission times as "hh:mm AM/PM DD/MM/YY" (its own
// server's local time — not specified which zone, treated as-is since only
// the date is ever displayed downstream, not the exact hour).
function parseCodeChefTimestamp(text: string): number | null {
  const match = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s+(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const [, hourStr, minuteStr, meridiem, dayStr, monthStr, yearStr] = match;
  let hour = Number(hourStr) % 12;
  if (meridiem === "PM") hour += 12;
  const year = 2000 + Number(yearStr);
  return new Date(year, Number(monthStr) - 1, Number(dayStr), hour, Number(minuteStr)).getTime();
}

export type CodeChefContest = {
  code: string;
  name: string;
  startTime: string; // ISO
  endTime: string; // ISO
  status: "future" | "present" | "past";
};

export async function getContests(): Promise<CodeChefContest[]> {
  const res = await fetch("https://www.codechef.com/api/list/contests/all", {
    headers: { "User-Agent": UA },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`CodeChef contests request failed: ${res.status}`);

  const json = await res.json();

  const map = (
    list: {
      contest_code: string;
      contest_name: string;
      contest_start_date_iso: string;
      contest_end_date_iso: string;
    }[],
    status: CodeChefContest["status"],
  ) =>
    (list ?? []).map((c) => ({
      code: c.contest_code,
      name: c.contest_name,
      startTime: c.contest_start_date_iso,
      endTime: c.contest_end_date_iso,
      status,
    }));

  return [
    ...map(json.present_contests, "present"),
    ...map(json.future_contests, "future"),
    ...map(json.past_contests, "past"),
  ];
}

export type CodeChefRatingPoint = {
  contestName: string;
  startTime: number; // epoch ms
  rating: number;
  rank: number | null;
};

// CodeChef's profile page embeds the same per-contest rating history its own
// rating graph renders from, as a `var all_rating = [...]` JS array in a
// <script> tag — genuinely public (verified against the live page), just
// never parsed out before.
export async function getRatingHistory(handle: string): Promise<CodeChefRatingPoint[] | null> {
  const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, {
    headers: { "User-Agent": UA },
    next: { revalidate: 0 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CodeChef profile request failed: ${res.status}`);

  const html = await res.text();
  const match = html.match(/var all_rating\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) return [];

  type RawEntry = { name: string; getyear: string; getmonth: string; getday: string; rating: string; rank: string };
  const raw = JSON.parse(match[1]) as RawEntry[];

  return raw
    .map((r) => ({
      contestName: r.name,
      startTime: Date.UTC(Number(r.getyear), Number(r.getmonth) - 1, Number(r.getday)),
      rating: Number(r.rating),
      rank: r.rank ? Number(r.rank) : null,
    }))
    .sort((a, b) => a.startTime - b.startTime);
}
