"use client";

import { useEffect, useState } from "react";
import { readLastHandles, writeLastHandles } from "@/hooks/use-last-handles";
import { ContestHistoryPanel } from "@/components/contest-history-panel";
import { HandleVerificationCard } from "@/components/handle-verification-card";
import { Button } from "@/components/ui/button";
import type { ContestHistoryResponse } from "@/app/api/contest-history/route";

export function ContestHistorySection() {
  const [handles, setHandles] = useState<{ lc?: string; cc?: string }>({});
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<ContestHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHandles(readLastHandles());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!handles.lc && !handles.cc) return;
    const params = new URLSearchParams();
    if (handles.lc) params.set("lc", handles.lc);
    if (handles.cc) params.set("cc", handles.cc);

    let cancelled = false;
    setLoading(true);
    fetch(`/api/contest-history?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ContestHistoryResponse | null) => {
        if (!cancelled) setData(json);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handles.lc, handles.cc]);

  if (!mounted) return null;

  if (!handles.lc && !handles.cc) {
    return (
      <div className="rounded-lg border border-foreground/[0.06] bg-foreground/[0.015] p-5">
        <h2 className="font-medium">Your contest history</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your handle to see rating graphs, trends, and your last 5 contests.
        </p>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const lc = String(formData.get("lc") ?? "").trim();
            const cc = String(formData.get("cc") ?? "").trim();
            const next = { lc: lc || undefined, cc: cc || undefined };
            writeLastHandles(next);
            setHandles(next);
          }}
        >
          <input
            name="lc"
            placeholder="LeetCode username"
            defaultValue={handles.lc}
            className="min-w-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            name="cc"
            placeholder="CodeChef username"
            defaultValue={handles.cc}
            className="min-w-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="sm">
            Show my history
          </Button>
        </form>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="rounded-lg border border-foreground/[0.06] bg-foreground/[0.015] p-5 text-sm text-muted-foreground">
        Loading your contest history…
      </div>
    );
  }

  const hasLeetCode = Boolean(data?.leetcode && data.leetcode.history.length > 0);
  const hasCodeChef = Boolean(data?.codechef && data.codechef.history.length > 0);
  const anyUnverified =
    (Boolean(handles.lc) && !data?.verifiedLeetCode) || (Boolean(handles.cc) && !data?.verifiedCodeChef);

  return (
    <div className="space-y-4">
      <h2 className="font-medium">Your contest history</h2>

      {anyUnverified && <HandleVerificationCard lc={handles.lc} cc={handles.cc} />}

      {!hasLeetCode && !hasCodeChef && !anyUnverified && (
        <div className="rounded-lg border border-foreground/[0.06] bg-foreground/[0.015] p-5 text-sm text-muted-foreground">
          No rated-contest history found for {[handles.lc, handles.cc].filter(Boolean).join(" / ")} yet.
        </div>
      )}

      {(hasLeetCode || hasCodeChef) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {hasLeetCode && data?.leetcode && (
            <ContestHistoryPanel
              platform="leetcode"
              handle={handles.lc ?? ""}
              history={data.leetcode.history}
              globalRanking={data.leetcode.globalRanking}
              totalParticipants={data.leetcode.totalParticipants}
              topPercentage={data.leetcode.topPercentage}
            />
          )}
          {hasCodeChef && data?.codechef && (
            <ContestHistoryPanel
              platform="codechef"
              handle={handles.cc ?? ""}
              history={data.codechef.history}
              stars={data.codechef.stars}
            />
          )}
        </div>
      )}
    </div>
  );
}
