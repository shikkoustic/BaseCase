import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// drizzle-kit (schema push/introspection) uses the session pooler — the
// transaction pooler that DATABASE_URL points to at runtime hangs on
// drizzle-kit's introspection queries.
const migrationsUrl = process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL;
if (!migrationsUrl) {
  throw new Error(
    "MIGRATIONS_DATABASE_URL (or DATABASE_URL) is not set (copy .env.local.example to .env.local)",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationsUrl,
  },
});
