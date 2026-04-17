import { generateChatCompletion } from "./llm.service.js"
import { getPersonalities } from "./personalities.service.js"
import { addMessage, ensureSessionForUser, listSessionMessages } from "./sessions.service.js"

const MAX_TOPIC_LENGTH = 1200
const COMPARATIVE_MAX_TOKENS = 700
const SUMMARY_MAX_TOKENS = 320
const SUMMARY_PREFIX = "## Sintesis institucional"

function sanitizeGeneratedContent(rawContent) {
  const content = String(rawContent ?? "").trim()
  if (!content) {
    return content
  }

  if (/[.!?)]$/.test(content)) {
    return content
  }

  const punctuationIndex = Math.max(content.lastIndexOf("."), content.lastIndexOf("!"), content.lastIndexOf("?"))
  if (punctuationIndex > Math.floor(content.length * 0.55)) {
    return content.slice(0, punctuationIndex + 1).trim()
  }

  const spaceIndex = content.lastIndexOf(" ")
  if (spaceIndex > 0) {
    return `${content.slice(0, spaceIndex).trim()}...`
  }

  return content
}

function buildSystemPrompt(personality) {
  const limits = Array.isArray(personality.thematicLimits) ? personality.thematicLimits : []

  return [
    `Eres ${personality.name}.`,
    `Rol: ${personality.roleDescription}`,
    `Estilo de respuesta: ${personality.styleGuide}`,
    `Marco de analisis: ${personality.analysisFrame}`,
    `Tipo de argumentos: ${personality.argumentStyle}`,
    `Instrucciones base: ${personality.baseInstructions}`,
    "Estas respondiendo dentro de un analisis comparativo con otras personalidades expertas.",
    "Mantente fiel a tu disciplina y evita adoptar el marco de otra personalidad.",
    "Responde en espanol, con claridad, estructura y densidad tecnica moderada.",
    "No dejes palabras ni frases incompletas al final de la respuesta.",
    "Usa Markdown simple con titulos y listas breves.",
    limits.length > 0 ? `Limites tematicos: ${limits.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function buildUserPrompt(topic) {
  return [
    "Tema a analizar comparativamente:",
    topic,
    "",
    "Instrucciones de salida:",
    "## Lectura disciplinar",
    "[explica el tema desde tu especialidad en 2 o 3 parrafos cortos]",
    "## Implicaciones clave",
    "- [impacto o criterio 1]",
    "- [impacto o criterio 2]",
    "- [impacto o criterio 3]",
    "## Punto de mayor relevancia",
    "[una conclusion concreta y propia de tu disciplina]",
    "",
    "Objetivo de extension: entre 140 y 220 palabras.",
    "Cierra siempre con una frase completa.",
  ].join("\n")
}

function buildSummaryPrompt(topic, responses) {
  const responsesText = responses
    .map((response) => `### ${response.personalityName}\n${response.content}`)
    .join("\n\n")

  return [
    "Tema analizado:",
    topic,
    "",
    "Respuestas recibidas:",
    responsesText,
    "",
    "Escribe una sintesis breve que señale coincidencias y diferencias reales entre las tres perspectivas.",
    "Formato sugerido:",
    "## Coincidencias",
    "- ...",
    "## Diferencias",
    "- ...",
    "## Sintesis final",
    "[2 o 3 frases]"]
    .join("\n")
}

function buildFallbackResponse(personalityName, topic) {
  return [
    `No fue posible generar la respuesta del ${personalityName} en este momento.`,
    `Tema recibido: ${topic}`,
    "Intenta nuevamente en unos segundos.",
  ].join("\n\n")
}

export async function processComparativeChat({ sessionId, message, personalityIds, userId }) {
  const normalizedMessage = String(message ?? "").trim()
  if (!normalizedMessage) {
    const error = new Error("Message is required")
    error.statusCode = 400
    throw error
  }

  if (normalizedMessage.length > MAX_TOPIC_LENGTH) {
    const error = new Error("Message is too long")
    error.statusCode = 400
    throw error
  }

  const allPersonalities = await getPersonalities()
  const selectedPersonalities = Array.isArray(personalityIds) && personalityIds.length > 0
    ? allPersonalities.filter((personality) => personalityIds.includes(personality.id))
    : allPersonalities

  if (selectedPersonalities.length === 0) {
    const error = new Error("No active personalities available")
    error.statusCode = 400
    throw error
  }

  const session = await ensureSessionForUser({ sessionId, mode: "comparative", userId })

  const userMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: normalizedMessage,
    createdAt: new Date().toISOString(),
  }
  await addMessage(session.id, userMessage)

  const responseResults = await Promise.all(
    selectedPersonalities.map(async (personality) => {
      try {
        const generation = await generateChatCompletion({
          systemPrompt: buildSystemPrompt(personality),
          userPrompt: buildUserPrompt(normalizedMessage),
          maxTokens: COMPARATIVE_MAX_TOKENS,
          temperature: 0.35,
        })

        return {
          personalityId: personality.id,
          personalityName: personality.name,
          content: sanitizeGeneratedContent(generation.content),
          usedFallback: false,
        }
      } catch (error) {
        return {
          personalityId: personality.id,
          personalityName: personality.name,
          content: buildFallbackResponse(personality.name, normalizedMessage),
          usedFallback: true,
          errorCode: error?.code ?? null,
        }
      }
    })
  )

  let optionalSummary = null

  try {
    const summaryGeneration = await generateChatCompletion({
      systemPrompt: [
        "Eres un moderador academico que sintetiza puntos de vista disciplinares.",
        "Escribe una sintesis neutral, breve y bien estructurada.",
        "No introduzcas ideas nuevas ni cambies el sentido de las respuestas.",
        "Asegura cierre completo de ideas; no termines con frases truncadas.",
      ].join("\n"),
      userPrompt: buildSummaryPrompt(normalizedMessage, responseResults),
      maxTokens: SUMMARY_MAX_TOKENS,
      temperature: 0.2,
    })

    optionalSummary = sanitizeGeneratedContent(summaryGeneration.content)
  } catch {
    optionalSummary = null
  }

  for (const response of responseResults) {
    await addMessage(session.id, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response.content,
      createdAt: new Date().toISOString(),
      personalityId: response.personalityId,
    })
  }

  if (optionalSummary) {
    await addMessage(session.id, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `${SUMMARY_PREFIX}\n${optionalSummary}`,
      createdAt: new Date().toISOString(),
      personalityId: null,
    })
  }

  return {
    sessionId: session.id,
    responses: responseResults.map(({ usedFallback, errorCode, ...response }) => response),
    optionalSummary,
    metadata: {
      totalPersonalities: selectedPersonalities.length,
      usedFallback: responseResults.some((response) => response.usedFallback),
      fallbackPersonalities: responseResults.filter((response) => response.usedFallback).map((response) => response.personalityId),
    },
  }
}

export async function getComparativeResultBySessionId(sessionId, userId) {
  if (!sessionId) {
    const error = new Error("Session id is required")
    error.statusCode = 400
    throw error
  }

  const messages = await listSessionMessages(sessionId, userId)
  const lastUserIndex = messages.map((message) => message.role).lastIndexOf("user")

  if (lastUserIndex < 0) {
    const error = new Error("No comparative messages found for this session")
    error.statusCode = 404
    throw error
  }

  const trailingMessages = messages.slice(lastUserIndex + 1)
  const allPersonalities = await getPersonalities()
  const nameById = new Map(allPersonalities.map((personality) => [personality.id, personality.name]))

  const responses = trailingMessages
    .filter((message) => message.role === "assistant" && Boolean(message.personalityId))
    .map((message) => ({
      personalityId: message.personalityId,
      personalityName: nameById.get(message.personalityId) ?? message.personalityId,
      content: message.content,
    }))

  if (responses.length === 0) {
    const error = new Error("No comparative responses found for this session")
    error.statusCode = 404
    throw error
  }

  const summaryMessage = trailingMessages.find(
    (message) => message.role === "assistant" && !message.personalityId && message.content.startsWith(SUMMARY_PREFIX)
  )

  return {
    sessionId,
    responses,
    optionalSummary: summaryMessage ? summaryMessage.content.replace(`${SUMMARY_PREFIX}\n`, "").trim() : null,
  }
}