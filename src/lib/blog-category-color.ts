// A small fixed palette, picked by a stable hash of the category name so new
// categories get a consistent color without editing a map by hand.
const BADGE_COLORS = [
  "border-emerald-500/20 bg-emerald-500/15 text-emerald-300",
  "border-sky-500/20 bg-sky-500/15 text-sky-300",
  "border-amber-500/20 bg-amber-500/15 text-amber-300",
  "border-rose-500/20 bg-rose-500/15 text-rose-300",
  "border-violet-500/20 bg-violet-500/15 text-violet-300",
];

const COVER_GRADIENTS = [
  "from-emerald-500/25 via-emerald-500/5 to-transparent",
  "from-sky-500/25 via-sky-500/5 to-transparent",
  "from-amber-500/25 via-amber-500/5 to-transparent",
  "from-rose-500/25 via-rose-500/5 to-transparent",
  "from-violet-500/25 via-violet-500/5 to-transparent",
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function categoryBadgeClass(category: string): string {
  return BADGE_COLORS[hash(category) % BADGE_COLORS.length];
}

export function categoryCoverGradient(category: string): string {
  return COVER_GRADIENTS[hash(category) % COVER_GRADIENTS.length];
}
