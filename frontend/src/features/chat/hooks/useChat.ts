import { useCallback, useState } from "react"

import { httpClient } from "@/shared/api/httpClient"
import type { ComparativeResult, ComparativeTurn, ChatMessage } from "@/shared/types/chat"
import type { PersonalityId } from "@/shared/types/personality"

interface SendIndividualParams {
  sessionId: string
  personalityId: PersonalityId
  message: string
}

interface SendComparativeParams {
  sessionId: string
  message: string
}

interface IndividualChatResponse {
  response: ChatMessage
}

interface ComparativeChatResponse extends ComparativeResult {}

interface SessionMessagesResponse {
  messages: ChatMessage[]
}

const comparativePersonalityNames: Record<PersonalityId, string> = {
  economist: "Economista",
  politest: "Politest",
  jurist: "Jurista",
}

const comparativeSummaryPrefix = "## Sintesis institucional"

function buildComparativeTurns(messages: ChatMessage[]): ComparativeTurn[] {
  const turns: ComparativeTurn[] = []
  let currentTurn: ComparativeTurn | null = null

  for (const message of messages) {
    if (message.role === "user") {
      if (currentTurn) {
        turns.push(currentTurn)
      }

      currentTurn = {
        id: message.id,
        prompt: message.content,
        createdAt: message.createdAt,
        result: {
          responses: [],
        },
      }

      continue
    }

    if (!currentTurn || message.role !== "assistant") {
      continue
    }

    if (message.personalityId) {
      currentTurn.result.responses.push({
        personalityId: message.personalityId,
        personalityName: comparativePersonalityNames[message.personalityId],
        content: message.content,
      })
      continue
    }

    if (message.content.startsWith(comparativeSummaryPrefix)) {
      currentTurn.result.optionalSummary = message.content.replace(`${comparativeSummaryPrefix}\n`, "").trim()
    }
  }

  if (currentTurn) {
    turns.push(currentTurn)
  }

  return turns.filter((turn) => turn.result.responses.length > 0)
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [comparativeResult, setComparativeResult] = useState<ComparativeResult | null>(null)
  const [comparativeHistory, setComparativeHistory] = useState<ComparativeTurn[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function appendMessage(message: ChatMessage) {
    setMessages((current) => [...current, message])
  }

  async function sendIndividual({ sessionId, personalityId, message }: SendIndividualParams) {
    setErrorMessage(null)

    const now = new Date().toISOString()
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: now,
    }

    appendMessage(userMessage)

    try {
      const result = await httpClient<IndividualChatResponse>("/chat/individual", {
        method: "POST",
        body: {
          sessionId,
          personalityId,
          message,
        },
      })

      appendMessage(result.response)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo obtener respuesta.")
      setMessages((current) => current.filter((item) => item.id !== userMessage.id))
    }
  }

  async function sendComparative({ sessionId, message }: SendComparativeParams) {
    setErrorMessage(null)

    const now = new Date().toISOString()
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: now,
    }

    appendMessage(userMessage)

    try {
      const result = await httpClient<ComparativeChatResponse>("/chat/comparative", {
        method: "POST",
        body: {
          sessionId,
          message,
        },
      })

      setComparativeResult(result)
      setComparativeHistory((current) => [
        ...current,
        {
          id: userMessage.id,
          prompt: message,
          createdAt: now,
          result,
        },
      ])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo obtener la comparación.")
      setMessages((current) => current.filter((item) => item.id !== userMessage.id))
    }
  }

  const loadComparativeSession = useCallback(async (sessionId: string) => {
    try {
      const result = await httpClient<SessionMessagesResponse>(`/sessions/${sessionId}/messages`)
      const turns = buildComparativeTurns(result.messages)
      setComparativeHistory(turns)
      setComparativeResult(turns.at(-1)?.result ?? null)
    } catch (error) {
      setComparativeResult(null)
      setComparativeHistory([])
      const message = error instanceof Error ? error.message : "No se pudo cargar el comparativo."
      if (message.includes("No comparative messages found") || message.includes("No comparative responses found")) {
        setErrorMessage(null)
        return
      }
      setErrorMessage(message)
    }
  }, [])

  function clearComparativeResult() {
    setComparativeResult(null)
    setComparativeHistory([])
  }

  function clearMessages() {
    setMessages([])
  }

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const result = await httpClient<SessionMessagesResponse>(`/sessions/${sessionId}/messages`)
      setMessages(result.messages)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar el historial.")
    }
  }, [])

  return {
    messages,
    comparativeResult,
    comparativeHistory,
    errorMessage,
    sendIndividual,
    sendComparative,
    loadComparativeSession,
    clearComparativeResult,
    clearMessages,
    loadSessionMessages,
  }
}
