"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "dsaclub-checked-problems";

// No accounts, so "did I solve this roadmap problem" lives in this browser
// only — a plain localStorage set of problem ids, kept in sync via
// useSyncExternalStore (not an effect — this is exactly the external-store
// case the hook exists for, and avoids the extra one-time re-render an
// effect-based mount sync would need).
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

function getServerSnapshot(): string {
  return "{}";
}

function parse(raw: string): Record<string, true> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function useCheckedProblems() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const checked = parse(raw);

  const setProblemChecked = useCallback((problemId: string, value: boolean) => {
    const next = parse(getSnapshot());
    if (value) next[problemId] = true;
    else delete next[problemId];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private browsing / storage disabled — checks just won't persist.
    }
    emitChange();
  }, []);

  return { checked, setProblemChecked };
}
