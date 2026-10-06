import { pgTable, pgEnum, text, integer, date, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const platformEnum = pgEnum("platform", ["leetcode", "codechef"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const levelEnum = pgEnum("level", ["beginner", "intermediate", "advanced"]);

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(), // markdown
  // Groups sub-topics under one heading on the roadmap index, e.g. several
  // "DP: ..." topics sharing category "Dynamic Programming". Null = stands
  // alone, not part of a split-out category.
  category: text("category"),
  // Where this topic sits in the learning progression — shown as a quiet
  // label on the roadmap list, not used for gating/locking anything.
  level: levelEnum("level").notNull().default("beginner"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const problems = pgTable("problems", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  externalRef: text("external_ref").notNull(), // LeetCode titleSlug or CodeChef problem code
  title: text("title").notNull(),
  url: text("url").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

// No accounts: a CodeChef handle is its own public identity. Raw daily
// snapshot of a handle's profile, diffed to produce a forward-only activity
// delta (CodeChef exposes no per-day submission history, so this is the only
// way to build one — see src/lib/platforms/codechef.ts).
export const codechefSnapshots = pgTable(
  "codechef_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    date: date("date").notNull(),
    rating: integer("rating"),
    totalSolved: integer("total_solved").notNull(),
  },
  (t) => [uniqueIndex("username_snapshot_date_unique").on(t.username, t.date)],
);

// Accumulates confirmed solves per handle so the roadmap can auto-check
// problems instead of relying only on manual localStorage checkboxes.
// Neither platform exposes a full solved-problem list publicly without auth:
// LeetCode's public API caps recentAcSubmissionList at 20, and CodeChef's
// profile page only lists solved problem *names* (no codes). So this grows
// forward-only, the same trade-off as codechefSnapshots above — every visit
// (and the daily cron, for CodeChef) adds whatever's newly visible, and old
// solves outside that window are only caught if the user checks them
// manually. externalRef is the LeetCode titleSlug, or the CodeChef problem
// name normalized (trimmed, lowercased, whitespace-collapsed) since that's
// the only match key CodeChef's public page gives us.
export const solvedProblems = pgTable(
  "solved_problems",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    handle: text("handle").notNull(),
    platform: platformEnum("platform").notNull(),
    externalRef: text("external_ref").notNull(),
    firstSeenAt: date("first_seen_at").notNull(),
  },
  (t) => [uniqueIndex("solved_handle_platform_ref_unique").on(t.handle, t.platform, t.externalRef)],
);

// Proves a visitor actually controls the LeetCode/CodeChef handle they typed
// in, before the roadmap treats that handle's solved problems as "theirs" —
// without this, anyone could paste in a stranger's public handle and have
// the app auto-check that person's real solved problems as their own
// progress. Verification is a one-time code the user pastes into a public,
// user-editable profile field (LeetCode's "Readme" under Settings → General,
// CodeChef's display Name) that we can read back via the same public APIs
// already used elsewhere — no email infrastructure, and it's a genuine
// ownership proof rather than just proof of owning an email address.
export const handleVerifications = pgTable(
  "handle_verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Scoped per signed-in Supabase user (auth.users.id), not shared globally
    // — the same handle can be independently re-verified under a different
    // account. Only whoever actually controls the real platform profile can
    // ever pass the bio-code check, so this is purely a privacy boundary
    // (whose dashboard this handle's data shows up on), not a security one.
    userId: uuid("user_id").notNull(),
    platform: platformEnum("platform").notNull(),
    handle: text("handle").notNull(),
    code: text("code").notNull(),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("handle_verification_user_platform_handle_unique").on(t.userId, t.platform, t.handle)],
);
