import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ensureDatabase, pool } from "@/lib/db"

async function getUserId() {
  try {
    return (await auth()).userId
  } catch {
    return null
  }
}

export async function GET() {
  const userId = await getUserId()
  if (!userId || !pool)
    return NextResponse.json({ signedIn: Boolean(userId), history: [] })
  await ensureDatabase()
  const result = await pool.query(
    'SELECT id, phrase, translations, created_at AS "createdAt" FROM translation_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 8',
    [userId]
  )
  return NextResponse.json({ signedIn: true, history: result.rows })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId || !pool) return NextResponse.json({ saved: false })
  await ensureDatabase()
  const body = await request.json().catch(() => null)
  const items = Array.isArray(body?.items) ? body.items : [body]
  let lastId: string | null = null
  for (const item of items.slice(0, 8)) {
    if (typeof item?.phrase !== "string" || !Array.isArray(item?.translations))
      continue
    const result = await pool.query(
      "INSERT INTO translation_history (user_id, phrase, translations) VALUES ($1, $2, $3) RETURNING id",
      [userId, item.phrase.slice(0, 1000), JSON.stringify(item.translations)]
    )
    lastId = String(result.rows[0].id)
  }
  return NextResponse.json({ saved: true, id: lastId })
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId || !pool)
    return NextResponse.json({ deleted: false }, { status: 401 })
  const body = await request.json().catch(() => null)
  const id = String(body?.id ?? "")
  if (!/^\d+$/.test(id))
    return NextResponse.json({ deleted: false }, { status: 400 })
  await ensureDatabase()
  const result = await pool.query(
    "DELETE FROM translation_history WHERE id = $1 AND user_id = $2",
    [id, userId]
  )
  return NextResponse.json({ deleted: Boolean(result.rowCount) })
}
