import { useMemo } from "react"

const SESSION_KEY = "paradiplomacy-session-id"

function getOrCreateSessionId() {
  const stored = window.sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    return stored
  }

  const nextId = `session-${crypto.randomUUID()}`
  window.sessionStorage.setItem(SESSION_KEY, nextId)
  return nextId
}

export function useSession() {
  const sessionId = useMemo(getOrCreateSessionId, [])

  return { sessionId }
}
