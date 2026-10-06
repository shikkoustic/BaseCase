import Link from "next/link";
import { Logo } from "@/components/logo";
import { LinkedinIcon } from "@/components/linkedin-icon";

const TOPIC_LINKS = [
  { href: "/topics/arrays-hashing", label: "Arrays & Hashing" },
  { href: "/topics/trees", label: "Trees & BSTs" },
  { href: "/topics/graphs-traversal", label: "Graphs" },
  { href: "/topics/dp-1d", label: "Dynamic Programming" },
  { href: "/topics", label: "All topics" },
];

const SITE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <Logo className="size-7" />
              DSA Club
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A topic-wise question bank curated from LeetCode and CodeChef,
              with one dashboard tracking your progress across both
              platforms. Free, always.
            </p>
          </div>

          <FooterColumn title="Topics" links={TOPIC_LINKS} />
          <FooterColumn title="DSA Club" links={SITE_LINKS} />

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Built by
            </h3>
            <div className="mt-3 text-sm">
              <p className="font-medium text-foreground/80">Shikhar Srivastava</p>
              <Link
                href="https://www.linkedin.com/in/shikkoustic"
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
              >
                <LinkedinIcon className="size-3.5" />
                LinkedIn
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DSA Club. Free, always.</p>
          <p>Built for students, by a student.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-foreground/80 hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
