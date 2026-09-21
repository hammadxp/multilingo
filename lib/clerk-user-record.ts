import { prisma } from "@/lib/prisma"

export type ClerkUserRecord = {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export async function upsertClerkUser({ id, ...data }: ClerkUserRecord) {
  return prisma.user.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  })
}
