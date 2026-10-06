import { Lightbulb } from "lucide-react";
import type { TopicConcept } from "@/lib/topic-concepts";

export function TopicConceptSection({ concept }: { concept: TopicConcept }) {
  return (
    <div className="mt-10 space-y-10 border-t border-border/60 pt-10">
      <section>
        <h2 className="text-lg font-semibold tracking-tight">Why start here</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{concept.whyItMatters}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">The core idea</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{concept.coreIdea}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">Key patterns to learn</h2>
        <div className="mt-4 space-y-6">
          {concept.patterns.map((pattern, i) => (
            <div key={pattern.name}>
              <h3 className="font-medium">
                {i + 1}. {pattern.name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pattern.description}</p>
              {pattern.code && (
                <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-foreground/[0.03] p-4 font-mono text-xs leading-relaxed">
                  <code>{pattern.code}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">Time &amp; space complexity</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {concept.complexity.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">The mental model</h2>
        <p className="mt-2 font-medium italic">&ldquo;{concept.mentalModel.question}&rdquo;</p>
        <p className="mt-1 leading-relaxed text-muted-foreground">{concept.mentalModel.answer}</p>
      </section>

      <div className="flex gap-3 rounded-lg border border-border/60 bg-foreground/[0.03] p-4">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm leading-relaxed text-muted-foreground">{concept.tip}</p>
      </div>
    </div>
  );
}
