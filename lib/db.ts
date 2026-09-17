import { Pool } from "pg"

declare global { var multilingoPool: Pool | undefined }

export const pool = process.env.DATABASE_URL ? global.multilingoPool ?? new Pool({ connectionString: process.env.DATABASE_URL }) : null
if (process.env.NODE_ENV !== "production" && pool) global.multilingoPool = pool

export async function ensureDatabase() {
  if (!pool) return false
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS translation_history (
      id BIGSERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      phrase TEXT NOT NULL,
      translations JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS translation_history_user_created_idx ON translation_history(user_id, created_at DESC);
  `)
  return true
}
