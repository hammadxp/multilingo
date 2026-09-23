import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { type NextRequest, NextResponse } from "next/server"

import { upsertClerkUser } from "@/lib/clerk-user-record"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!signingSecret) {
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 }
    )
  }

  let event

  try {
    event = await verifyWebhook(request, { signingSecret })
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    )
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const user = event.data
    const email =
      user.email_addresses.find(
        (item) => item.id === user.primary_email_address_id
      )?.email_address ??
      user.email_addresses[0]?.email_address ??
      null

    await upsertClerkUser({
      id: user.id,
      email,
      firstName: user.first_name,
      lastName: user.last_name,
      imageUrl: user.image_url,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    })
  } else if (event.type === "user.deleted" && event.data.id) {
    await prisma.user.deleteMany({ where: { id: event.data.id } })
  }

  return NextResponse.json({ received: true })
}
