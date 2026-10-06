"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { readLastHandles, writeLastHandles } from "@/hooks/use-last-handles";

export function HandleForm({
  initialLc,
  initialCc,
  compact = false,
}: {
  initialLc: string;
  initialCc: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (initialLc || initialCc) {
      writeLastHandles({ lc: initialLc || undefined, cc: initialCc || undefined });
      return;
    }
    if (redirectedRef.current) return;
    const last = readLastHandles();
    if (last.lc || last.cc) {
      redirectedRef.current = true;
      const params = new URLSearchParams();
      if (last.lc) params.set("lc", last.lc);
      if (last.cc) params.set("cc", last.cc);
      router.replace(`/dashboard?${params.toString()}`);
    }
  }, [initialLc, initialCc, router]);

  return (
    <form
      className={compact ? "flex flex-wrap items-end gap-3" : "space-y-4"}
      action="/dashboard"
      method="get"
      onSubmit={(e) => {
        const formData = new FormData(e.currentTarget);
        const lc = String(formData.get("lc") ?? "").trim();
        const cc = String(formData.get("cc") ?? "").trim();
        writeLastHandles({ lc: lc || undefined, cc: cc || undefined });
      }}
    >
      <div className="space-y-1.5">
        {!compact && (
          <label htmlFor="lc" className="text-sm font-medium">
            LeetCode username
          </label>
        )}
        <input
          id="lc"
          name="lc"
          defaultValue={initialLc}
          placeholder={compact ? "LeetCode username" : "e.g. votrubac"}
          className="w-full min-w-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1.5">
        {!compact && (
          <label htmlFor="cc" className="text-sm font-medium">
            CodeChef username
          </label>
        )}
        <input
          id="cc"
          name="cc"
          defaultValue={initialCc}
          placeholder={compact ? "CodeChef username" : "e.g. gennady.korotkevich"}
          className="w-full min-w-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {!compact && (
          <p className="text-xs text-muted-foreground">
            CodeChef doesn&apos;t publish per-day activity, so tracking starts from
            today — no history before your first lookup.
          </p>
        )}
      </div>
      <Button type="submit" size={compact ? "sm" : "default"}>
        {compact ? "Update" : "See my dashboard"}
      </Button>
    </form>
  );
}
