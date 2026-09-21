import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

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
  if (!userId)
    return NextResponse.json({
      signedIn: Boolean(userId),
      history: [],
      hasMore: false,
    })
  const url = new URL(request.url)
  const limit = boundedInteger(url.searchParams.get("limit"), 8, 1, 50)
  const offset = boundedInteger(url.searchParams.get("offset"), 0, 0, 1_000_000)
  const [history, count] = await Promise.all([
    prisma.translationHistory.findMany({
      where: { userId },
      select: { id: true, phrase: true, translations: true, createdAt: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: offset,
    }),
    prisma.translationHistory.count({ where: { userId } }),
  ])

  return NextResponse.json({
    signedIn: true,
    history: history.map((item) => ({ ...item, id: item.id.toString() })),
    hasMore: offset + history.length < count,
  })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ saved: false })
  const body = await request.json().catch(() => null)
  const items = Array.isArray(body?.items) ? body.items : [body]
  let lastId: string | null = null
  for (const item of items.slice(0, 8)) {
    if (typeof item?.phrase !== "string" || !Array.isArray(item?.translations))
      continue
    const result = await prisma.translationHistory.create({
      data: {
        userId,
        phrase: item.phrase.slice(0, 1000),
        translations: item.translations,
      },
      select: { id: true },
    })
    lastId = result.id.toString()
  }
  return NextResponse.json({ saved: true, id: lastId })
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ deleted: false }, { status: 401 })
  const body = await request.json().catch(() => null)
  const id = String(body?.id ?? "")
  if (!/^\d+$/.test(id))
    return NextResponse.json({ deleted: false }, { status: 400 })
  const result = await prisma.translationHistory.deleteMany({
    where: { id: BigInt(id), userId },
  })

  return NextResponse.json({ deleted: result.count > 0 })
}
