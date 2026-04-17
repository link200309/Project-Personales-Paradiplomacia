import { prisma } from "../config/prisma.js"

export async function createSession({ mode = "individual", userId, personalityId = null, title = null, forcedId }) {
  const sessionId = forcedId ?? `session-${crypto.randomUUID()}`
  const existingById = await prisma.session.findUnique({ where: { id: sessionId } })

  if (existingById) {
    if (existingById.userId !== userId) {
      const error = new Error("Session id already belongs to another user")
      error.statusCode = 403
      throw error
    }

    if (existingById.mode === mode) {
      return existingById
    }

    return prisma.session.update({
      where: { id: existingById.id },
      data: { mode },
    })
  }

  return prisma.session.create({
    data: {
      id: sessionId,
      mode,
      userId,
      personalityId,
      title,
    },
  })
}

export function getSessionById(sessionId) {
  return prisma.session.findUnique({
    where: { id: sessionId },
  })
}

export function getUserSessionById(sessionId, userId) {
  return prisma.session.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  })
}

export function getUserSession(userId) {
  return prisma.session.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

export function getSessionMessages(sessionId, userId) {
  return prisma.message.findMany({
    where: {
      sessionId,
      session: {
        userId,
      },
    },
    orderBy: { createdAt: "asc" },
  })
}

export function listSessions(userId, limit = 10) {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      personality: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })
}

export function updateSession(sessionId, data) {
  return prisma.session.update({
    where: { id: sessionId },
    data,
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
