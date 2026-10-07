"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useCheckedProblems } from "@/hooks/use-checked-problems";
import { useAutoSolved } from "@/contexts/auto-solved";
import { DifficultySection } from "@/components/difficulty-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LEVEL_LABEL, LEVEL_BADGE_CLASS } from "@/lib/difficulty";

const DIFFICULTY_ORDER = ["easy", "medium", "hard"] as const;

type Problem = {
  id: string;
  title: string;
  url: string;
  platform: "leetcode" | "codechef";
  externalRef: string;
  difficulty: "easy" | "medium" | "hard";
};

type SubTopic = {
  id: string;
  slug: string;
  name: string;
  description: string;
  problems: Problem[];
};

// Several topics sharing one `category` (e.g. five "Graphs: ..." topics)
// collapse into a single roadmap row with internal tabs, instead of each
// cluttering the flat list as its own row.
export function TopicCategoryGroupRow({
  index,
  category,
  level,
  subTopics,
}: {
  index: number;
  category: string;
  level: string;
  subTopics: SubTopic[];
}) {
  const [open, setOpen] = useState(false);
  const { checked } = useCheckedProblems();
  const { autoSolvedIds } = useAutoSolved();

  const allProblems = subTopics.flatMap((t) => t.problems);
  const solved = allProblems.filter((p) => checked[p.id] || autoSolvedIds.has(p.id)).length;
  const total = allProblems.length;

  return (
    <div className="overflow-hidden rounded-lg border border-foreground/[0.06] bg-foreground/[0.015]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={LEVEL_BADGE_CLASS}>{LEVEL_LABEL[level] ?? level}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{category}</span>
        <span className="hidden shrink-0 text-xs text-muted-foreground/70 sm:inline">
          {subTopics.length} subtopics
        </span>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {solved}/{total}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-foreground/[0.06] bg-foreground/[0.01] px-4 py-5">
          <Tabs defaultValue={subTopics[0].slug}>
            <TabsList variant="line" className="mb-4 flex-wrap">
              {subTopics.map((t) => (
                <TabsTrigger key={t.slug} value={t.slug} className="flex-none">
                  {t.name.startsWith(`${category}:`) ? t.name.slice(category.length + 1).trim() : t.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {subTopics.map((t) => (
              <TabsContent key={t.slug} value={t.slug} className="space-y-6">
                <div className="space-y-2">
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {t.description}
                  </p>
                  <Link
                    href={`/topics/${t.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Getting started with {t.name}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                {DIFFICULTY_ORDER.map((difficulty) => {
                  const group = t.problems.filter((p) => p.difficulty === difficulty);
                  if (group.length === 0) return null;
                  return (
                    <DifficultySection
                      key={difficulty}
                      difficulty={difficulty}
                      problems={group}
                      topicSlug={t.slug}
                    />
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
