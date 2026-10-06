import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { handleVerifications } from "@/db/schema";
import * as leetcode from "@/lib/platforms/leetcode";
import * as codechef from "@/lib/platforms/codechef";

type Platform = "leetcode" | "codechef";

function generateCode(): string {
  return `dsaclub-${Math.random().toString(36).slice(2, 8)}`;
}

export type VerificationStatus = {
  verified: boolean;
  code: string;
};

function matchKey(userId: string, platform: Platform, handle: string) {
  return and(
    eq(handleVerifications.userId, userId),
    eq(handleVerifications.platform, platform),
    eq(handleVerifications.handle, handle),
  );
}

// Returns the existing pending/verified record for this (user, handle),
// creating one (with a fresh code) if none exists yet. Idempotent — repeat
// calls while pending return the same code rather than invalidating it.
// Scoped per signed-in user: the same handle verified under a different
// account is a separate record, so each account re-proves ownership itself.
export async function getOrCreateVerification(
  userId: string,
  platform: Platform,
  handle: string,
): Promise<VerificationStatus> {
  const [existing] = await db.select().from(handleVerifications).where(matchKey(userId, platform, handle));

  if (existing) {
    return { verified: existing.verifiedAt !== null, code: existing.code };
  }

  const code = generateCode();
  await db
    .insert(handleVerifications)
    .values({ userId, platform, handle, code })
    .onConflictDoNothing({ target: [handleVerifications.userId, handleVerifications.platform, handleVerifications.handle] });

  const [row] = await db.select().from(handleVerifications).where(matchKey(userId, platform, handle));
  return { verified: row?.verifiedAt != null, code: row?.code ?? code };
}

export async function isHandleVerified(userId: string, platform: Platform, handle: string): Promise<boolean> {
  const [row] = await db
    .select({ verifiedAt: handleVerifications.verifiedAt })
    .from(handleVerifications)
    .where(matchKey(userId, platform, handle));
  return row?.verifiedAt != null;
}

// Checks the handle's public profile for the pending code; marks verified on
// a match. Safe to call repeatedly (e.g. a "Check now" button) — once
// verified, it short-circuits without re-fetching the profile.
export async function checkVerification(
  userId: string,
  platform: Platform,
  handle: string,
): Promise<VerificationStatus> {
  const existing = await getOrCreateVerification(userId, platform, handle);
  if (existing.verified) return existing;

  const haystack = platform === "leetcode" ? await leetcode.getAboutMe(handle) : await codechef.getName(handle);
  const found = haystack?.includes(existing.code) ?? false;

  if (found) {
    await db.update(handleVerifications).set({ verifiedAt: new Date() }).where(matchKey(userId, platform, handle));
    return { verified: true, code: existing.code };
  }
  return existing;
}
