import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (copy .env.local.example to .env.local)");
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  // Supabase's pooler silently closes idle connections server-side; without
  // these, postgres-js can hand out a dead connection from its pool and the
  // next query hangs until it times out (seen as "read ETIMEDOUT").
  // Recycling proactively avoids ever handing out a connection that old.
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });
