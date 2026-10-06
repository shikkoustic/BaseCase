import { categoryCoverGradient } from "@/lib/blog-category-color";

// No illustration assets to pull real cover images from, so posts get a
// generated gradient block instead of a fabricated placeholder image.
export function BlogCover({ category, className = "" }: { category: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br ${categoryCoverGradient(category)} ${className}`}
    >
      <span className="select-none text-sm font-medium uppercase tracking-widest text-foreground/30">
        {category}
      </span>
    </div>
  );
}
