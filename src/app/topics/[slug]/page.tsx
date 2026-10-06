import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { topics, problems } from "@/db/schema";
import { DifficultySection } from "@/components/difficulty-section";
import { TopicProgress } from "@/components/topic-progress";
import { TopicConceptSection } from "@/components/topic-concept-section";
import { AutoSolvedProvider } from "@/contexts/auto-solved";
import { LEVEL_LABEL, LEVEL_BADGE_CLASS } from "@/lib/difficulty";
import { TOPIC_CONCEPTS } from "@/lib/topic-concepts";
import { requireUser } from "@/lib/supabase/dal";

const DIFFICULTY_ORDER = ["easy", "medium", "hard"] as const;

export default async function TopicPage({ params }: PageProps<"/topics/[slug]">) {
  await requireUser();
  const { slug } = await params;

  const [topic] = await db.select().from(topics).where(eq(topics.slug, slug));
  if (!topic) notFound();

  const topicProblems = await db
    .select()
    .from(problems)
    .where(eq(problems.topicId, topic.id))
    .orderBy(problems.orderIndex);

  return (
    <AutoSolvedProvider>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link
          href="/topics"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to roadmap
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className={LEVEL_BADGE_CLASS}>{LEVEL_LABEL[topic.level] ?? topic.level}</span>
          {topic.category && (
            <span className="text-xs text-muted-foreground/70">{topic.category}</span>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{topic.name}</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          {topic.description}
        </p>

        <TopicProgress problemIds={topicProblems.map((p) => p.id)} />

        {TOPIC_CONCEPTS[topic.slug] && <TopicConceptSection concept={TOPIC_CONCEPTS[topic.slug]} />}

        <div className="mt-8 space-y-6">
          {DIFFICULTY_ORDER.map((difficulty) => {
            const group = topicProblems.filter((p) => p.difficulty === difficulty);
            if (group.length === 0) return null;
            return (
              <DifficultySection
                key={difficulty}
                difficulty={difficulty}
                problems={group}
                topicSlug={topic.slug}
              />
            );
          })}
        </div>
      </div>
    </AutoSolvedProvider>
  );
}
