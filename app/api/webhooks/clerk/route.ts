import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { ensureDatabase, pool } from "@/lib/db"

export async function POST(request: Request) {
  if (!pool || !process.env.CLERK_WEBHOOK_SIGNING_SECRET) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 })
  const headerList = await headers()
  const svixHeaders = { "svix-id": headerList.get("svix-id") ?? "", "svix-timestamp": headerList.get("svix-timestamp") ?? "", "svix-signature": headerList.get("svix-signature") ?? "" }
  let event: { type: string; data: Record<string, unknown> }
  try { event = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET).verify(await request.text(), svixHeaders) as unknown as typeof event } catch { return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 }) }
  await ensureDatabase()
  const data = event.data
  const email = Array.isArray(data.email_addresses) ? (data.email_addresses[0] as { email_address?: string })?.email_address ?? null : null
  if (event.type === "user.created" || event.type === "user.updated") await pool.query("INSERT INTO users (id, email, first_name, last_name, image_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, image_url = EXCLUDED.image_url, updated_at = NOW()", [data.id, email, data.first_name ?? null, data.last_name ?? null, data.image_url ?? null])
  else if (event.type === "user.deleted") await pool.query("DELETE FROM users WHERE id = $1", [data.id])
  return NextResponse.json({ received: true })
}
