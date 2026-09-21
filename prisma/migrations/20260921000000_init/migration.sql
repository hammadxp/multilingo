CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "first_name" TEXT,
  "last_name" TEXT,
  "image_url" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "translation_history" (
  "id" BIGSERIAL NOT NULL,
  "user_id" TEXT NOT NULL,
  "phrase" TEXT NOT NULL,
  "translations" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "translation_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "translation_history_user_created_idx"
  ON "translation_history"("user_id", "created_at" DESC);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'translation_history_user_id_fkey') THEN
    ALTER TABLE "translation_history"
      ADD CONSTRAINT "translation_history_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
