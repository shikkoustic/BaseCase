// Matches IntervueClub's restrained style: plain lowercase colored text,
// no pill backgrounds — not a loud colored badge for every label.
export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

export const DIFFICULTY_TEXT_CLASS: Record<string, string> = {
  easy: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  hard: "text-rose-600 dark:text-rose-400",
};

// Kept for the one spot that still wants a pill (the "in 2 days" contest
// countdown) — everything else uses the plain text classes above.
export const PLATFORM_CLASS: Record<string, string> = {
  leetcode: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  codechef: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
};

// Tinted badge for difficulty — color-at-low-opacity fill + border, the same
// restrained pattern IntervueClub uses for its easy/medium/hard tags (not a
// solid-filled chip).
export const DIFFICULTY_BADGE_CLASS: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

// A career-ladder naming (think FIFA player tiers) instead of the generic
// beginner/intermediate/advanced wording — same three underlying buckets
// (see the `level` column on topics), just less generic-SaaS-template.
export const LEVEL_LABEL: Record<string, string> = {
  beginner: "Amateur",
  intermediate: "Semi-Pro",
  advanced: "Pro",
};

// Deliberately quiet/neutral (not colored) — a progression marker, not a
// status to draw the eye, matching the understated level tag on
// dev-resource-hub's roadmap list.
export const LEVEL_BADGE_CLASS =
  "text-[10px] uppercase tracking-wide text-muted-foreground/80 bg-foreground/[0.03] border border-foreground/[0.06] px-2 py-0.5 rounded shrink-0";
