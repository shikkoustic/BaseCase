export type ContestPoint = {
  contestName: string;
  startTime: number;
  rating: number;
};

export type ContestInsights = {
  currentRating: number;
  peakRating: number;
  deltaSinceStart: number;
  // Rating change over the last 3 contests — null when there aren't even
  // 2 contests to compare.
  last3Delta: number | null;
  bestContest: { contestName: string; delta: number } | null;
  worstContest: { contestName: string; delta: number } | null;
  // Last 5 contests, most recent first, each with its own single-contest delta.
  recent: (ContestPoint & { delta: number })[];
};

export function computeContestInsights(history: ContestPoint[]): ContestInsights | null {
  if (history.length === 0) return null;

  const sorted = [...history].sort((a, b) => a.startTime - b.startTime);
  const withDelta = sorted.map((p, i) => ({ ...p, delta: i === 0 ? 0 : p.rating - sorted[i - 1].rating }));

  const currentRating = sorted[sorted.length - 1].rating;
  const peakRating = Math.max(...sorted.map((p) => p.rating));
  const deltaSinceStart = currentRating - sorted[0].rating;

  const last3ReferenceIdx = Math.max(0, sorted.length - 1 - 3);
  const last3Delta = sorted.length >= 2 ? currentRating - sorted[last3ReferenceIdx].rating : null;

  let best = withDelta[0];
  let worst = withDelta[0];
  for (const p of withDelta.slice(1)) {
    if (p.delta > best.delta) best = p;
    if (p.delta < worst.delta) worst = p;
  }

  return {
    currentRating,
    peakRating,
    deltaSinceStart,
    last3Delta,
    bestContest: sorted.length > 1 ? { contestName: best.contestName, delta: best.delta } : null,
    worstContest: sorted.length > 1 ? { contestName: worst.contestName, delta: worst.delta } : null,
    recent: withDelta.slice(-5).reverse(),
  };
}
