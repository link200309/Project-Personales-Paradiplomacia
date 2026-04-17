import {
  appendSessionMessage,
  createSession,
  getUserSession,
  getUserSessionById,
  getSessionMessages,
  listSessions,
  updateSession,
} from "../repositories/sessions.repository.js"
import { getPersonalityById } from "./personalities.service.js"

function mapMessage(message) {
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
  }
}

function mapSession(session) {
  return {
    ...session,
    createdAt: session.createdAt.toISOString(),
  }
}

export async function ensureSession(sessionId, mode = "individual") {
  return ensureSessionForUser({ sessionId, mode, userId: null })
}

export async function ensureSessionForUser({ sessionId, mode = "individual", userId }) {
  if (!userId) {
    const error = new Error("userId is required")
    error.statusCode = 400
    throw error
  }

  if (!sessionId) {
    const created = await createSession({ mode, userId })
    return mapSession(created)
  }

  const existing = await getUserSessionById(sessionId, userId)
  if (existing) {
    return mapSession(existing)
  }

  const created = await createSession({ mode, userId, forcedId: sessionId })
  return mapSession(created)
}

export async function createNewSession(mode = "individual", userId, personalityId = null) {
  if (!userId) {
    const error = new Error("userId is required")
    error.statusCode = 400
    throw error
  }

  let title = null
  let resolvedPersonalityId = null

  if (mode === "individual" && personalityId) {
    const personality = await getPersonalityById(personalityId)
    if (personality) {
      resolvedPersonalityId = personality.id
      title = personality.name
    }
  }

  const session = await createSession({ mode, userId, personalityId: resolvedPersonalityId, title })
  return mapSession(session)
}

export async function listSessionMessages(sessionId, userId) {
  if (!userId) {
    const error = new Error("userId is required")
    error.statusCode = 400
    throw error
  }

  let targetSessionId = sessionId
  if (!targetSessionId) {
    // Fallback to latest user session only when a specific session id was not provided.
    const userSession = await getUserSession(userId)
    targetSessionId = userSession?.id ?? null
  }

  if (!targetSessionId) {
    return []
  }

  const messages = await getSessionMessages(targetSessionId, userId)
  return messages.map(mapMessage)
}

export async function listRecentSessions(userId, limit = 10) {
  if (!userId) {
    const error = new Error("userId is required")
    error.statusCode = 400
    throw error
  }

  const sessions = await listSessions(userId, limit)

  return sessions.map((session) => ({
    id: session.id,
    mode: session.mode,
    title: session.title ?? null,
    personalityId: session.personalityId ?? null,
    personalityName: session.personality?.name ?? null,
    createdAt: session.createdAt.toISOString(),
    lastMessage: session.messages[0]
      ? {
          content: session.messages[0].content,
          role: session.messages[0].role,
          createdAt: session.messages[0].createdAt.toISOString(),
          personalityId: session.messages[0].personalityId ?? null,
        }
      : null,
  }))
}

export async function addMessage(sessionId, message) {
  const created = await appendSessionMessage(sessionId, message)
  return mapMessage(created)
}
