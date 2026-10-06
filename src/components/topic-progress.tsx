"use client";

import { useCheckedProblems } from "@/hooks/use-checked-problems";
import { useAutoSolved } from "@/contexts/auto-solved";

export function TopicProgress({ problemIds }: { problemIds: string[] }) {
  const { checked } = useCheckedProblems();
  const { autoSolvedIds } = useAutoSolved();
  const solvedCount = problemIds.filter((id) => checked[id] || autoSolvedIds.has(id)).length;
  const total = problemIds.length;

  return (
    <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
      <span className="font-mono">
        {solvedCount} / {total}
      </span>
      <span>checked off</span>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${total ? (solvedCount / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
