import { useEffect, useState } from "react"

import { httpClient } from "@/shared/api/httpClient"
import type { InteractionMode } from "@/app/store"

const SESSION_KEY = "paradiplomacy-session-id"
const AUTH_ID_KEY = "paradiplomacy-user-id"

interface CreateSessionResponse {
  sessionId: string
}

function getStoredSessionId() {
  const stored = window.sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    return stored
  }

  return null
}

async function createSession(mode: InteractionMode = "individual", personalityId: string | null = null) {
  const response = await httpClient<CreateSessionResponse>("/sessions", {
    method: "POST",
    body: {
      mode,
      personalityId,
    },
  })

  window.sessionStorage.setItem(SESSION_KEY, response.sessionId)
  return response.sessionId
}

export function useSession() {
  const hasAuthenticatedUser = Boolean(window.sessionStorage.getItem(AUTH_ID_KEY))
  const [sessionId, setSessionId] = useState<string | null>(getStoredSessionId)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasAuthenticatedUser) {
      setIsLoading(false)
      return
    }

    if (sessionId) {
      setIsLoading(false)
      return
    }

    setIsLoading(false)
  }, [hasAuthenticatedUser, sessionId])

  async function resetSession(mode: InteractionMode = "individual", personalityId: string | null = null) {
    if (!hasAuthenticatedUser) {
      const authError = new Error("Authentication required")
      setError("Debes iniciar sesión para crear historial.")
      throw authError
    }

    setError(null)
    setIsLoading(true)

    try {
      const nextSessionId = await createSession(mode, personalityId)
      setSessionId(nextSessionId)
      return nextSessionId
    } catch (resetError) {
      setError("No se pudo reiniciar la sesion.")
      throw resetError
    } finally {
      setIsLoading(false)
    }
  }

  function selectSession(nextSessionId: string) {
    window.sessionStorage.setItem(SESSION_KEY, nextSessionId)
    setError(null)
    setSessionId(nextSessionId)
  }

  return { sessionId, isLoading, error, resetSession, selectSession }
}
