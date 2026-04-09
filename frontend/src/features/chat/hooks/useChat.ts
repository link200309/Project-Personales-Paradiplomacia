import { useState } from "react"

import type { ComparativeResult, ChatMessage } from "@/shared/types/chat"
import type { Personality, PersonalityId } from "@/shared/types/personality"
import { normalizeResponse } from "@/shared/utils/normalizeResponse"

interface SendIndividualParams {
  personalityId: PersonalityId
  message: string
}

interface SendComparativeParams {
  message: string
  personalities: Personality[]
}

const personalityPrefixes: Record<PersonalityId, string> = {
  economist: `Tu texto está bien planteado, pero se puede mejorar en fluidez, claridad y precisión institucional. Te dejo una versión corregida y optimizada 👇

El Sistema Universitario Boliviano (SUB), a través del Comité Ejecutivo de la Universidad Boliviana (CEUB), impulsa la adopción del Modelo CUDIE, una propuesta desarrollada por la Dirección de Relaciones Internacionales de la Universidad Mayor de San Simón (UMSS), que fortalece la cooperación y la modernización institucional en el ámbito de las relaciones internacionales.

Este modelo promueve:

🔹 Comunicación orgánica entre universidades del Sistema Universitario Boliviano.
🔹 Participación activa de las diferentes unidades y actores (facultades y autoridades) en procesos estratégicos.
🔹 Acceso a información oportuna para la toma de decisiones.
🔹 Planificación coordinada y alineada a nivel institucional.

La implementación del Modelo CUDIE representa un paso importante hacia una gestión más articulada, inclusiva y estratégica en nuestras universidades.

#UMSS #CEUB #CUDIE #EducaciónSuperior #Internacionalización #GestiónUniversitaria

Cambios clave que hice:
Eliminé la repetición de “una iniciativa” para evitar redundancia.
Cambié “de universidades” → “entre universidades” (más correcto).
Simplifiqué “procesos estratégicos de comunicación” → “procesos estratégicos” (más claro y general).
Ajusté la puntuación y fluidez general.

Si quieres, puedo hacerte una versión más corta (tipo copy publicitario) o una más institucional/formal 👍`,
  politest: "From a political strategy lens",
  jurist: "From a legal and institutional standpoint",
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [comparativeResult, setComparativeResult] = useState<ComparativeResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function appendMessage(message: ChatMessage) {
    setMessages((current) => [...current, message])
  }

  async function sendIndividual({ personalityId, message }: SendIndividualParams) {
    setErrorMessage(null)

    const now = new Date().toISOString()
    appendMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: now,
    })

    const response = normalizeResponse(
      `${personalityPrefixes[personalityId]}, this MVP answer suggests creating a phased roadmap with measurable indicators and local stakeholder mapping.`
    )

    appendMessage({
      id: crypto.randomUUID(),
      role: "assistant",
      content: response,
      createdAt: new Date().toISOString(),
      personalityId,
    })
  }

  async function sendComparative({ message, personalities }: SendComparativeParams) {
    setErrorMessage(null)

    appendMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    })

    const responses = personalities.map((personality) => ({
      personalityId: personality.id,
      personalityName: personality.name,
      content: normalizeResponse(
        `${personalityPrefixes[personality.id]}, the proposed line of action on "${message}" should be piloted with clear governance, timeline, and validation checkpoints.`
      ),
    }))

    setComparativeResult({
      responses,
      optionalSummary:
        "All three perspectives agree on piloting with clear accountability. They differ on the first priority: budget certainty, coalition viability, and legal safeguards.",
    })
  }

  function clearComparativeResult() {
    setComparativeResult(null)
  }

  function clearMessages() {
    setMessages([])
  }

  return {
    messages,
    comparativeResult,
    errorMessage,
    sendIndividual,
    sendComparative,
    clearComparativeResult,
    clearMessages,
  }
}
