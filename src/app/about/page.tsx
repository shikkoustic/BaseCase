import Link from "next/link";
import { LinkedinIcon } from "@/components/linkedin-icon";

export const metadata = {
  title: "About | DSA Club",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About DSA Club</h1>

      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          DSA Club is a topic-wise DSA roadmap built on top of real LeetCode and
          CodeChef data — not a generic list of links, but a curated path where
          every topic is explained before you&apos;re asked to practice it, and
          your progress across both platforms is tracked in one place.
        </p>
        <p>
          It exists because most DSA prep is either a wall of unsorted problems
          or a paid course. This is neither: it&apos;s free, has no account
          requirement to start, and is built and maintained by one person
          actively going through the same prep.
        </p>
        <p>
          Spotted a bug, a wrong complexity note, or a problem that should be
          on the roadmap? Reach out on LinkedIn below.
        </p>
      </div>

      <div className="mt-10 border-t border-border/60 pt-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Built by
        </h2>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-medium">Shikhar Srivastava</span>
          <Link
            href="https://www.linkedin.com/in/shikkoustic"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <LinkedinIcon className="size-4" />
            LinkedIn
          </Link>
        </div>
      </div>
    </div>
  );
}
