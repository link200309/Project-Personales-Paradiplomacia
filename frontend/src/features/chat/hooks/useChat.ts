import { useCallback, useState } from "react"

import { httpClient } from "@/shared/api/httpClient"
import type { ChatMessage, ComparativeResult, ComparativeTurn, DebateResult, DebateTurn } from "@/shared/types/chat"
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

interface SendDebateParams {
  sessionId: string
  message: string
}

interface ComparativeChatResponse extends ComparativeResult {}

interface DebateChatResponse extends DebateResult {}

interface SessionMessagesResponse {
  messages: ChatMessage[]
}

const comparativePersonalityNames: Record<PersonalityId, string> = {
  economist: "Economista",
  politest: "Politest",
  jurist: "Jurista",
}

const debatePersonalityNames = comparativePersonalityNames

const comparativeSummaryPrefix = "## Sintesis institucional"
const debateSummaryPrefix = "## Síntesis del debate"
const debateInitialPrefix = "## Postura inicial"
const debateReactionPrefix = "## Réplica"

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

function buildDebateTurns(messages: ChatMessage[]): DebateTurn[] {
  const turns: DebateTurn[] = []
  let currentTurn: DebateTurn | null = null
  let assistantMessages: ChatMessage[] = []

  function finalizeCurrentTurn() {
    if (!currentTurn) {
      return
    }

    const midpoint = Math.ceil(assistantMessages.length / 2)
    currentTurn.result.initialPositions = assistantMessages.slice(0, midpoint).map((message) => ({
      personalityId: message.personalityId as PersonalityId,
      personalityName: debatePersonalityNames[message.personalityId as PersonalityId],
      content: message.content.replace(`${debateInitialPrefix}\n`, "").trim(),
    }))
    currentTurn.result.reactions = assistantMessages.slice(midpoint).map((message) => ({
      personalityId: message.personalityId as PersonalityId,
      personalityName: debatePersonalityNames[message.personalityId as PersonalityId],
      content: message.content.replace(`${debateReactionPrefix}\n`, "").trim(),
    }))

    if (currentTurn.result.initialPositions.length > 0 || currentTurn.result.reactions.length > 0) {
      turns.push(currentTurn)
    }
  }

  for (const message of messages) {
    if (message.role === "user") {
      finalizeCurrentTurn()

      currentTurn = {
        id: message.id,
        prompt: message.content,
        createdAt: message.createdAt,
        result: {
          initialPositions: [],
          reactions: [],
        },
      }
      assistantMessages = []
      continue
    }

    if (!currentTurn || message.role !== "assistant") {
      continue
    }

    if (message.personalityId) {
      assistantMessages.push(message)
      continue
    }

    if (message.content.startsWith(debateSummaryPrefix)) {
      currentTurn.result.synthesis = message.content.replace(`${debateSummaryPrefix}\n`, "").trim()
    }
  }

  finalizeCurrentTurn()
  return turns
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [comparativeResult, setComparativeResult] = useState<ComparativeResult | null>(null)
  const [comparativeHistory, setComparativeHistory] = useState<ComparativeTurn[]>([])
  const [debateResult, setDebateResult] = useState<DebateResult | null>(null)
  const [debateHistory, setDebateHistory] = useState<DebateTurn[]>([])
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

    const streamingAssistantId = crypto.randomUUID()
    const streamingAssistantMessage: ChatMessage = {
      id: streamingAssistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      personalityId,
    }

    appendMessage(streamingAssistantMessage)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api"
      const userId = window.sessionStorage.getItem("paradiplomacy-user-id")

      const response = await fetch(`${API_BASE_URL}/chat/individual/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "x-user-id": userId } : {}),
        },
        body: JSON.stringify({
          sessionId,
          personalityId,
          message,
        }),
      })

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message ?? `Request failed with status ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let buffer = ""
      let completedMessage: ChatMessage | null = null

      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split("\n\n")
        buffer = chunks.pop() ?? ""

        for (const chunk of chunks) {
          const lines = chunk.split("\n")
          const eventLine = lines.find((line) => line.startsWith("event:"))
          const dataLine = lines.find((line) => line.startsWith("data:"))
          if (!eventLine || !dataLine) {
            continue
          }

          const eventType = eventLine.replace("event:", "").trim()
          const rawData = dataLine.replace("data:", "").trim()
          const data = JSON.parse(rawData)

          if (eventType === "token") {
            const token = String(data.token ?? "")
            setMessages((current) =>
              current.map((item) =>
                item.id === streamingAssistantId
                  ? {
                      ...item,
                      content: item.content + token,
                    }
                  : item
              )
            )
            continue
          }

          if (eventType === "done") {
            completedMessage = data.response as ChatMessage
            setMessages((current) =>
              current.map((item) => (item.id === streamingAssistantId ? completedMessage as ChatMessage : item))
            )
            continue
          }

          if (eventType === "error") {
            throw new Error(data.message ?? "No se pudo obtener respuesta.")
          }
        }
      }

      if (!completedMessage) {
        throw new Error("La respuesta en streaming no finalizo correctamente.")
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo obtener respuesta.")
      setMessages((current) => current.filter((item) => item.id !== userMessage.id && item.id !== streamingAssistantId))
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

  async function sendDebate({ sessionId, message }: SendDebateParams) {
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
      const result = await httpClient<DebateChatResponse>("/chat/debate", {
        method: "POST",
        body: {
          sessionId,
          message,
        },
      })

      setDebateResult(result)
      setDebateHistory((current) => [
        ...current,
        {
          id: userMessage.id,
          prompt: message,
          createdAt: now,
          result,
        },
      ])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo obtener el debate.")
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

  const loadDebateSession = useCallback(async (sessionId: string) => {
    try {
      const result = await httpClient<{ messages: ChatMessage[] }>(`/sessions/${sessionId}/messages`)
      const turns = buildDebateTurns(result.messages)
      setDebateHistory(turns)
      setDebateResult(turns.at(-1)?.result ?? null)
    } catch (error) {
      setDebateResult(null)
      setDebateHistory([])
      const message = error instanceof Error ? error.message : "No se pudo cargar el debate."
      if (message.includes("No debate messages found") || message.includes("No debate responses found")) {
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

  function clearDebateResult() {
    setDebateResult(null)
    setDebateHistory([])
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
    debateResult,
    debateHistory,
    errorMessage,
    sendIndividual,
    sendComparative,
    sendDebate,
    loadComparativeSession,
    loadDebateSession,
    clearComparativeResult,
    clearDebateResult,
    clearMessages,
    loadSessionMessages,
  }
}
