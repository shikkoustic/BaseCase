"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";

type Status = { verified: boolean; code: string };

function PlatformVerify({
  platform,
  handle,
  fieldHint,
}: {
  platform: "leetcode" | "codechef";
  handle: string;
  fieldHint: string;
}) {
  const [status, setStatus] = useState<Status | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/verify?platform=${platform}&handle=${encodeURIComponent(handle)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Status | null) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [platform, handle]);

  async function check() {
    setChecking(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle }),
      });
      if (res.ok) setStatus(await res.json());
    } finally {
      setChecking(false);
    }
  }

  if (!status) return null;

  if (status.verified) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <PlatformIcon platform={platform} className="size-4" />
        <span className="font-medium">{handle}</span>
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5" /> Verified
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-foreground/[0.06] bg-foreground/[0.015] p-4">
      <div className="flex items-center gap-2">
        <PlatformIcon platform={platform} className="size-4" />
        <span className="font-medium">{handle}</span>
        <span className="text-xs text-muted-foreground">not verified</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste this code into your {fieldHint}, then check back here. This proves the
        handle is actually yours before the roadmap auto-tracks its solved problems
        as your progress.
      </p>
      <code className="mt-2 inline-block rounded border border-foreground/[0.08] bg-foreground/[0.04] px-2 py-1 font-mono text-xs">
        {status.code}
      </code>
      <div className="mt-3">
        <Button size="sm" onClick={check} disabled={checking}>
          {checking ? "Checking…" : "I've added it — check now"}
        </Button>
      </div>
    </div>
  );
}

export function HandleVerificationCard({ lc, cc }: { lc?: string; cc?: string }) {
  if (!lc && !cc) return null;

  return (
    <div className="space-y-3">
      {lc && (
        <PlatformVerify
          platform="leetcode"
          handle={lc}
          fieldHint='LeetCode "Readme" (Settings → General)'
        />
      )}
      {cc && (
        <PlatformVerify
          platform="codechef"
          handle={cc}
          fieldHint='CodeChef "Name" field (Edit Profile)'
        />
      )}
    </div>
  );
}
