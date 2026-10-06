"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { readLastHandles } from "@/hooks/use-last-handles";

type AutoSolvedState = {
  autoSolvedIds: Set<string>;
  loading: boolean;
  verifiedLeetCode: boolean;
  verifiedCodeChef: boolean;
};

const AutoSolvedContext = createContext<AutoSolvedState>({
  autoSolvedIds: new Set(),
  loading: false,
  verifiedLeetCode: false,
  verifiedCodeChef: false,
});

// Feeds every roadmap-progress view (dashboard stat, topic list, topic
// detail checkboxes) the set of problem ids confirmed solved via the user's
// actual LeetCode/CodeChef activity — not just manually checked locally.
// Pages that already know the handles from the URL (the dashboard) pass
// `initialHandles`; pages that don't (the topics pages) fall back to the
// last-looked-up handles remembered in localStorage.
export function AutoSolvedProvider({
  children,
  initialHandles,
}: {
  children: ReactNode;
  initialHandles?: { lc?: string; cc?: string };
}) {
  const [state, setState] = useState<AutoSolvedState>({
    autoSolvedIds: new Set(),
    loading: true,
    verifiedLeetCode: false,
    verifiedCodeChef: false,
  });

  useEffect(() => {
    const { lc, cc } = initialHandles ?? readLastHandles();
    if (!lc && !cc) {
      setState({ autoSolvedIds: new Set(), loading: false, verifiedLeetCode: false, verifiedCodeChef: false });
      return;
    }

    const params = new URLSearchParams();
    if (lc) params.set("lc", lc);
    if (cc) params.set("cc", cc);

    let cancelled = false;
    fetch(`/api/solved?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { problemIds: [], verifiedLeetCode: false, verifiedCodeChef: false }))
      .then((data: { problemIds: string[]; verifiedLeetCode: boolean; verifiedCodeChef: boolean }) => {
        if (!cancelled) {
          setState({
            autoSolvedIds: new Set(data.problemIds),
            loading: false,
            verifiedLeetCode: data.verifiedLeetCode,
            verifiedCodeChef: data.verifiedCodeChef,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ autoSolvedIds: new Set(), loading: false, verifiedLeetCode: false, verifiedCodeChef: false });
      });

    return () => {
      cancelled = true;
    };
  }, [initialHandles?.lc, initialHandles?.cc]);

  return <AutoSolvedContext.Provider value={state}>{children}</AutoSolvedContext.Provider>;
}

export function useAutoSolved() {
  return useContext(AutoSolvedContext);
}
