import { prisma } from "../config/prisma.js"

export async function createSession(mode = "individual", forcedId) {
  const sessionId = forcedId ?? `session-${crypto.randomUUID()}`
  const existing = await prisma.session.findUnique({ where: { id: sessionId } })

  if (existing) {
    return existing
  }

  return prisma.session.create({
    data: {
      id: sessionId,
      mode,
    },
  })
}

export function getSessionById(sessionId) {
  return prisma.session.findUnique({
    where: { id: sessionId },
  })
}

export function getSessionMessages(sessionId) {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  })
}

export function listSessions(limit = 10) {
  return prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })
}

export function appendSessionMessage(sessionId, message) {
  return prisma.message.create({
    data: {
      id: message.id,
      sessionId,
      role: message.role,
      content: message.content,
      personalityId: message.personalityId ?? null,
      createdAt: message.createdAt ? new Date(message.createdAt) : undefined,
    },
  })
}
