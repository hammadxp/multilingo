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

function boundedInteger(
  value: string | null,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = value === null ? fallback : Number(value)
  return Number.isSafeInteger(parsed)
    ? Math.min(max, Math.max(min, parsed))
    : fallback
}

export async function GET(request: Request) {
  const userId = await getUserId()
  if (!userId || !pool)
    return NextResponse.json({
      signedIn: Boolean(userId),
      history: [],
      hasMore: false,
    })
  const url = new URL(request.url)
  const limit = boundedInteger(url.searchParams.get("limit"), 8, 1, 50)
  const offset = boundedInteger(url.searchParams.get("offset"), 0, 0, 1_000_000)
  await ensureDatabase()
  const [result, count] = await Promise.all([
    pool.query(
      'SELECT id, phrase, translations, created_at AS "createdAt" FROM translation_history WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    ),
    pool.query(
      "SELECT COUNT(*)::int AS count FROM translation_history WHERE user_id = $1",
      [userId]
    ),
  ])
  return NextResponse.json({
    signedIn: true,
    history: result.rows,
    hasMore: offset + result.rows.length < count.rows[0].count,
  })
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
