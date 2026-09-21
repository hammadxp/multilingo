import "dotenv/config"

import { createClerkClient } from "@clerk/nextjs/server"

import { upsertClerkUser } from "../lib/clerk-user-record"
import { prisma } from "../lib/prisma"

const PAGE_SIZE = 500

async function syncClerkUsers() {
  const secretKey = process.env.CLERK_SECRET_KEY

  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is not configured.")
  }

  const clerk = createClerkClient({ secretKey })
  let offset = 0
  let synced = 0

  while (true) {
    const page = await clerk.users.getUserList({ limit: PAGE_SIZE, offset })

    await Promise.all(
      page.data.map((user) =>
        upsertClerkUser({
          id: user.id,
          email:
            user.primaryEmailAddress?.emailAddress ??
            user.emailAddresses[0]?.emailAddress ??
            null,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        })
      )
    )

    synced += page.data.length
    console.log(`Synced ${synced} of ${page.totalCount} Clerk users.`)

    if (synced >= page.totalCount || page.data.length === 0) {
      break
    }

    offset += page.data.length
  }
}

syncClerkUsers()
  .catch((error) => {
    console.error("Clerk user sync failed.", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
