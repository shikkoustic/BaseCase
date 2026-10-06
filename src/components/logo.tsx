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
      <path
        d="M11.5 11L7.5 16L11.5 21"
        stroke="var(--background)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 11L24.5 16L20.5 21"
        stroke="var(--background)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.25 8.5L14.75 23.5"
        stroke="var(--background)"
        strokeWidth="2.25"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
