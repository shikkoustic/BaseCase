// Three nested frames collapsing to a solid center — a recursive call
// narrowing down until it terminates, i.e. hits its base case.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      <rect
        x="6.5"
        y="6.5"
        width="19"
        height="19"
        rx="4"
        stroke="var(--background)"
        strokeWidth="1.6"
        opacity="0.45"
      />
      <rect
        x="10.5"
        y="10.5"
        width="11"
        height="11"
        rx="2.5"
        stroke="var(--background)"
        strokeWidth="1.6"
        opacity="0.75"
      />
      <rect x="14" y="14" width="4" height="4" rx="1" fill="var(--background)" />
    </svg>
  );
}
