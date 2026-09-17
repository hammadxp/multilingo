# Multilingo

Multilingo translates one phrase into six languages at the same time. Guests keep their recent phrases in the browser. Signed-in users sync history to Postgres, and any browser history is migrated after Clerk authentication is available.

## Run locally

1. Start a local Postgres database and create a database named `multilingo`.
2. Fill in the values in `.env`:

```env
GOOGLE_CLOUD_TRANSLATE_API_KEY="your-google-cloud-translate-key"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/multilingo"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SIGNING_SECRET="whsec_..."
```

3. In Clerk, add a webhook for `/api/webhooks/clerk` and subscribe to `user.created`, `user.updated`, and `user.deleted`.
4. Install and run the app:

```bash
pnpm install
pnpm dev
```

The users and translation history tables are created automatically on the first authenticated history request. The complete SQL is also available in `db/schema.sql`.

Without API or Clerk keys, the interface still runs in preview mode with sample translations and browser-only history.
