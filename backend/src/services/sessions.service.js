import {
  appendSessionMessage,
  createSession,
  getSessionById,
  getSessionMessages,
  listSessions,
} from "../repositories/sessions.repository.js"

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
  if (!sessionId) {
    const created = await createSession(mode)
    return mapSession(created)
  }

  const existing = await getSessionById(sessionId)
  if (existing) {
    return mapSession(existing)
  }

  const created = await createSession(mode, sessionId)
  return mapSession(created)
}

export async function createNewSession(mode = "individual") {
  const session = await createSession(mode)
  return mapSession(session)
}

export async function listSessionMessages(sessionId) {
  const messages = await getSessionMessages(sessionId)
  return messages.map(mapMessage)
}

export async function listRecentSessions(limit = 10) {
  const sessions = await listSessions(limit)

  return sessions.map((session) => ({
    id: session.id,
    mode: session.mode,
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
