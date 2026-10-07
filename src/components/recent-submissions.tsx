"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentActivityResponse } from "@/app/api/recent-activity/route";

type Option = { platform: "leetcode" | "codechef"; handle: string };

export function RecentSubmissions({ options }: { options: Option[] }) {
  const [selected, setSelected] = useState(options[0]);
  const [data, setData] = useState<RecentActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/recent-activity?platform=${selected.platform}&handle=${encodeURIComponent(selected.handle)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: RecentActivityResponse | null) => {
        if (!cancelled) setData(json);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected.platform, selected.handle]);

  if (options.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recent submissions</CardTitle>
        {options.length > 1 ? (
          <select
            value={selected.platform}
            onChange={(e) => {
              const next = options.find((o) => o.platform === e.target.value);
              if (next) setSelected(next);
            }}
            className="rounded-md border border-input bg-transparent px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {options.map((o) => (
              <option key={o.platform} value={o.platform}>
                {o.platform === "leetcode" ? "LeetCode" : "CodeChef"}
              </option>
            ))}
          </select>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PlatformIcon platform={selected.platform} className="size-3" />
            {selected.platform === "leetcode" ? "LeetCode" : "CodeChef"}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading && <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>}

        {!loading && data && data.items.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recent {selected.platform === "leetcode" ? "accepted submissions" : "activity"} found.
          </p>
        )}

        {!loading && data && data.items.length > 0 && (
          <ul className="divide-y divide-border">
            {data.items.map((item, i) => {
              const accepted = item.result === "accepted";
              return (
                <li key={`${item.title}-${i}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    {accepted ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:text-foreground hover:underline"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span className="truncate">{item.title}</span>
                    )}
                    {!accepted && (
                      <span className="shrink-0 text-xs text-muted-foreground">({item.result})</span>
                    )}
                    {item.score && <span className="shrink-0 text-xs text-muted-foreground">{item.score}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    {item.timestamp && (
                      <span>{new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
