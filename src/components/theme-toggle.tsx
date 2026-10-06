"use client";

import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

// A transition in flight when another is requested aborts with
// InvalidStateError — e.g. a fast double-click. That's an expected, harmless
// outcome of the animation (the theme still gets set), not a bug to surface.
let activeTransition: ViewTransition | null = null;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  function toggleTheme(e: React.MouseEvent<HTMLButtonElement>) {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    if (!document.startViewTransition || activeTransition) {
      setTheme(next);
      return;
    }

    const { clientX: x, clientY: y } = e;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    document.documentElement.style.setProperty("--theme-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-y", `${y}px`);
    document.documentElement.style.setProperty("--theme-r", `${radius}px`);

    // next-themes' setTheme only schedules a state update; the actual
    // classList change happens in a useEffect. flushSync forces that to
    // happen synchronously inside the callback, which the View Transition
    // API requires to capture the "after" state correctly.
    try {
      activeTransition = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });
      activeTransition.ready.catch(() => {});
      activeTransition.updateCallbackDone.catch(() => {});
      activeTransition.finished.catch(() => {}).finally(() => {
        activeTransition = null;
      });
    } catch {
      activeTransition = null;
      setTheme(next);
    }
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
