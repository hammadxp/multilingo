import type { WebhookEvent } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"

import { upsertClerkUser } from "@/lib/clerk-user-record"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!signingSecret) {
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 }
    )
  }

  const headerList = await headers()
  const svixHeaders = {
    "svix-id": headerList.get("svix-id") ?? "",
    "svix-timestamp": headerList.get("svix-timestamp") ?? "",
    "svix-signature": headerList.get("svix-signature") ?? "",
  }

  let event: WebhookEvent

  try {
    event = new Webhook(signingSecret).verify(
      await request.text(),
      svixHeaders
    ) as unknown as WebhookEvent
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
