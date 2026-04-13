import { useEffect, useState } from "react"

import { httpClient } from "@/shared/api/httpClient"
import type { InteractionMode } from "@/app/store"

const SESSION_KEY = "paradiplomacy-session-id"

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

async function createSession(mode: InteractionMode = "individual") {
  const response = await httpClient<CreateSessionResponse>("/sessions", {
    method: "POST",
    body: {
      mode,
    },
  })

  window.sessionStorage.setItem(SESSION_KEY, response.sessionId)
  return response.sessionId
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(getStoredSessionId)
  const [isLoading, setIsLoading] = useState<boolean>(!sessionId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function initializeSession() {
      try {
        const nextSessionId = await createSession()
        if (!cancelled) {
          setSessionId(nextSessionId)
        }
      } catch {
        if (!cancelled) {
          setError("No se pudo iniciar la sesion.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void initializeSession()

    return () => {
      cancelled = true
    }
  }, [sessionId])

  async function resetSession(mode: InteractionMode = "individual") {
    setError(null)
    setIsLoading(true)

    try {
      const nextSessionId = await createSession(mode)
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
