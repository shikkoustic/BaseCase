"use client";

const STORAGE_KEY = "dsaclub-last-handles";

export type LastHandles = { lc?: string; cc?: string };

export function readLastHandles(): LastHandles {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeLastHandles(handles: LastHandles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(handles));
  } catch {
    // Private browsing / storage disabled — just won't be remembered.
  }
}
