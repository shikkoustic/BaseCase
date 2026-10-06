"use client";

import { useCheckedProblems } from "@/hooks/use-checked-problems";
import { useAutoSolved } from "@/contexts/auto-solved";
import { Card, CardContent } from "@/components/ui/card";

export function RoadmapStat({ allProblemIds }: { allProblemIds: string[] }) {
  const { checked } = useCheckedProblems();
  const { autoSolvedIds } = useAutoSolved();
  const solved = allProblemIds.filter((id) => checked[id] || autoSolvedIds.has(id)).length;

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="font-mono text-2xl font-semibold">
          {solved} / {allProblemIds.length}
        </p>
        <p className="text-sm text-muted-foreground">Roadmap problems checked</p>
      </CardContent>
    </Card>
  );
}
