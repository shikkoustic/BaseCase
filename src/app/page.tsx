import Link from "next/link";
import { ArrowRight, Flame, ListChecks, Trophy } from "lucide-react";
import { db } from "@/db";
import { topics, problems } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoadmapTree } from "@/components/roadmap-tree";
import { buildTopicSlots } from "@/lib/topic-slots";

export default async function HomePage() {
  const allTopics = await db.select().from(topics).orderBy(topics.orderIndex);
  const allProblems = await db.select().from(problems);

  // A plain object, not a Map — Map doesn't cross the server-to-client
  // component boundary as reliably (it's passed through React Server
  // Components' own serialization, not a normal JSON prop) and this was the
  // one spot in the app actually doing that.
  const countsByTopic: Record<string, number> = {};
  for (const p of allProblems) {
    countsByTopic[p.topicId] = (countsByTopic[p.topicId] ?? 0) + 1;
  }
  const slots = buildTopicSlots(allTopics);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-start gap-6 py-16 sm:py-24">
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          Free — no paywalls, ever
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Stop wandering, start solving.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          A topic-wise question bank curated from LeetCode and CodeChef, with
          every topic explained before you dive in — plus one dashboard
          tracking your progress across both platforms.
        </p>
        <Button
          size="lg"
          nativeButton={false}
          render={
            <Link href="/topics">
              Start the roadmap <ArrowRight className="size-4" />
            </Link>
          }
        />
      </section>

      <section className="pb-20">
        <h2 className="text-2xl font-semibold tracking-tight">The path</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          How each topic builds on the last — from the fundamentals to advanced
          techniques.
        </p>
        <div className="mt-8">
          <RoadmapTree slots={slots} countsByTopic={countsByTopic} />
        </div>
      </section>

      <section className="grid gap-4 pb-20 sm:grid-cols-3">
        <FeatureCard
          icon={<ListChecks className="size-5" />}
          title="Curated, topic-wise"
          description="Hand-picked problems per topic from LeetCode and CodeChef, each topic explained before you dive in."
        />
        <FeatureCard
          icon={<Flame className="size-5" />}
          title="Real activity heatmap"
          description="Your actual LeetCode submission history plus day-by-day CodeChef tracking, merged into one calendar."
        />
        <FeatureCard
          icon={<Trophy className="size-5" />}
          title="Contest tracker"
          description="Upcoming and past LeetCode + CodeChef contests in one place, so you never miss a rated round."
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
