"use client";

import { useCheckedProblems } from "@/hooks/use-checked-problems";
import { useAutoSolved } from "@/contexts/auto-solved";

export function RoadmapProgress({
  topics,
}: {
  topics: { id: string; name: string; problemIds: string[] }[];
}) {
  const { checked } = useCheckedProblems();
  const { autoSolvedIds } = useAutoSolved();

  return (
    <div className="space-y-3">
      {topics.map((topic) => {
        const solved = topic.problemIds.filter((id) => checked[id] || autoSolvedIds.has(id)).length;
        const total = topic.problemIds.length;
        return (
          <div key={topic.id} className="text-sm">
            <div className="mb-1 flex justify-between text-muted-foreground">
              <span>{topic.name}</span>
              <span className="font-mono">
                {solved}/{total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${total ? (solved / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
