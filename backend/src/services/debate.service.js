import { generateChatCompletion } from "./llm.service.js"
import { getPersonalities } from "./personalities.service.js"
import { addMessage, ensureSessionForUser, listSessionMessages } from "./sessions.service.js"

const MAX_TOPIC_LENGTH = 1200
const INITIAL_MAX_TOKENS = 320
const REACTION_MAX_TOKENS = 260
const SUMMARY_MAX_TOKENS = 320
const INITIAL_PREFIX = "## Postura inicial"
const REACTION_PREFIX = "## Réplica"
const SUMMARY_PREFIX = "## Síntesis del debate"

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
    "Estas respondiendo dentro de una mesa redonda disciplinar sobre paradiplomacia.",
    "Mantente fiel a tu disciplina, sin diluir tu perspectiva ni adoptar el marco de otra personalidad.",
    "Responde en espanol, con claridad, densidad tecnica moderada y cierre completo de ideas.",
    "Usa Markdown simple con titulos y listas breves.",
    limits.length > 0 ? `Limites tematicos: ${limits.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function buildInitialPrompt(topic) {
  return [
    "Tema del debate:",
    topic,
    "",
    "Instrucciones de salida:",
    `${INITIAL_PREFIX}`,
    "[formula una postura inicial propia de tu disciplina en 2 o 3 parrafos cortos]",
    "## Tesis",
    "[una idea central clara]",
    "## Argumentos clave",
    "- [argumento 1]",
    "- [argumento 2]",
    "- [argumento 3]",
    "## Pregunta de tension",
    "[una objecion o pregunta que dejas abierta para el debate]",
    "",
    "Extensión objetivo: entre 120 y 180 palabras.",
  ].join("\n")
}

function buildReactionPrompt(topic, ownInitialPosition, otherInitialPositions) {
  const othersText = otherInitialPositions
    .map((position) => `### ${position.personalityName}\n${position.content}`)
    .join("\n\n")

  return [
    "Tema del debate:",
    topic,
    "",
    "Tu postura inicial previa:",
    ownInitialPosition,
    "",
    "Posturas de las otras personalidades:",
    othersText,
    "",
    "Instrucciones de salida:",
    `${REACTION_PREFIX}`,
    "[responde a las otras posturas con acuerdo, matiz o desacuerdo razonado]",
    "## Coincidencia o ajuste",
    "[indica el punto en el que converges o corriges tu postura]",
    "## Observación crítica",
    "[formula una crítica puntual a una de las intervenciones]",
    "## Implicación para la paradiplomacia",
    "[cierra con una consecuencia practica para el tema debatido]",
    "",
    "Extensión objetivo: entre 90 y 140 palabras.",
  ].join("\n")
}

function buildSummaryPrompt(topic, initialPositions, reactions) {
  const initialText = initialPositions.map((position) => `### ${position.personalityName}\n${position.content}`).join("\n\n")
  const reactionText = reactions.map((reaction) => `### ${reaction.personalityName}\n${reaction.content}`).join("\n\n")

  return [
    "Tema del debate:",
    topic,
    "",
    "Posturas iniciales:",
    initialText,
    "",
    "Réplicas:",
    reactionText,
    "",
    "Escribe una sintesis neutral y util para decision institucional.",
    "No agregues ideas nuevas.",
    "Formato sugerido:",
    `${SUMMARY_PREFIX}`,
    "## Coincidencias",
    "- ...",
    "## Divergencias",
    "- ...",
    "## Lectura final",
    "[2 o 3 frases con cierre institucional]",
  ].join("\n")
}

function buildFallbackResponse(personalityName, topic, label) {
  return [
    `${label} no disponible para ${personalityName} en este momento.`,
    `Tema recibido: ${topic}`,
    "Intenta nuevamente en unos segundos.",
  ].join("\n\n")
}

export async function processDebateChat({ sessionId, message, personalityIds, userId }) {
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

  const session = await ensureSessionForUser({ sessionId, mode: "debate", userId })

  const userMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: normalizedMessage,
    createdAt: new Date().toISOString(),
  }
  await addMessage(session.id, userMessage)

  const initialPositions = await Promise.all(
    selectedPersonalities.map(async (personality) => {
      try {
        const generation = await generateChatCompletion({
          systemPrompt: buildSystemPrompt(personality),
          userPrompt: buildInitialPrompt(normalizedMessage),
          maxTokens: INITIAL_MAX_TOKENS,
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
          content: buildFallbackResponse(personality.name, normalizedMessage, "La postura inicial"),
          usedFallback: true,
          errorCode: error?.code ?? null,
        }
      }
    })
  )

  const reactions = await Promise.all(
    selectedPersonalities.map(async (personality, index) => {
      const ownInitialPosition = initialPositions[index]
      const otherInitialPositions = initialPositions.filter((_, positionIndex) => positionIndex !== index)

      try {
        const generation = await generateChatCompletion({
          systemPrompt: buildSystemPrompt(personality),
          userPrompt: buildReactionPrompt(normalizedMessage, ownInitialPosition.content, otherInitialPositions),
          maxTokens: REACTION_MAX_TOKENS,
          temperature: 0.3,
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
          content: buildFallbackResponse(personality.name, normalizedMessage, "La réplica"),
          usedFallback: true,
          errorCode: error?.code ?? null,
        }
      }
    })
  )

  let synthesis = null

  try {
    const summaryGeneration = await generateChatCompletion({
      systemPrompt: [
        "Eres un moderador academico que sintetiza un debate interdisciplinar.",
        "Escribe una sintesis neutral, breve y bien estructurada.",
        "No introduzcas ideas nuevas ni cambies el sentido de las intervenciones.",
        "Asegura cierre completo de ideas; no termines con frases truncadas.",
      ].join("\n"),
      userPrompt: buildSummaryPrompt(normalizedMessage, initialPositions, reactions),
      maxTokens: SUMMARY_MAX_TOKENS,
      temperature: 0.2,
    })

    synthesis = sanitizeGeneratedContent(summaryGeneration.content)
  } catch {
    synthesis = null
  }

  for (const initialPosition of initialPositions) {
    await addMessage(session.id, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `${INITIAL_PREFIX}\n${initialPosition.content}`,
      createdAt: new Date().toISOString(),
      personalityId: initialPosition.personalityId,
    })
  }

  for (const reaction of reactions) {
    await addMessage(session.id, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `${REACTION_PREFIX}\n${reaction.content}`,
      createdAt: new Date().toISOString(),
      personalityId: reaction.personalityId,
    })
  }

  if (synthesis) {
    await addMessage(session.id, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `${SUMMARY_PREFIX}\n${synthesis}`,
      createdAt: new Date().toISOString(),
      personalityId: null,
    })
  }

  return {
    sessionId: session.id,
    initialPositions: initialPositions.map(({ usedFallback, errorCode, ...response }) => response),
    reactions: reactions.map(({ usedFallback, errorCode, ...response }) => response),
    synthesis,
    metadata: {
      totalPersonalities: selectedPersonalities.length,
      usedFallback: [...initialPositions, ...reactions].some((response) => response.usedFallback),
      fallbackPersonalities: [...initialPositions, ...reactions]
        .filter((response) => response.usedFallback)
        .map((response) => response.personalityId),
    },
  }
}

export async function getDebateResultBySessionId(sessionId, userId) {
  if (!sessionId) {
    const error = new Error("Session id is required")
    error.statusCode = 400
    throw error
  }

  const messages = await listSessionMessages(sessionId, userId)
  const lastUserIndex = messages.map((message) => message.role).lastIndexOf("user")

  if (lastUserIndex < 0) {
    const error = new Error("No debate messages found for this session")
    error.statusCode = 404
    throw error
  }

  const trailingMessages = messages.slice(lastUserIndex + 1)
  const allPersonalities = await getPersonalities()
  const nameById = new Map(allPersonalities.map((personality) => [personality.id, personality.name]))

  const assistantMessages = trailingMessages.filter((message) => message.role === "assistant" && Boolean(message.personalityId))
  if (assistantMessages.length === 0) {
    const error = new Error("No debate responses found for this session")
    error.statusCode = 404
    throw error
  }

  const midpoint = Math.ceil(assistantMessages.length / 2)
  const initialMessages = assistantMessages.slice(0, midpoint)
  const reactionMessages = assistantMessages.slice(midpoint)

  const synthesisMessage = trailingMessages.find(
    (message) => message.role === "assistant" && !message.personalityId && message.content.startsWith(SUMMARY_PREFIX)
  )

  return {
    sessionId,
    initialPositions: initialMessages.map((message) => ({
      personalityId: message.personalityId,
      personalityName: nameById.get(message.personalityId) ?? message.personalityId,
      content: message.content.replace(`${INITIAL_PREFIX}\n`, "").trim(),
    })),
    reactions: reactionMessages.map((message) => ({
      personalityId: message.personalityId,
      personalityName: nameById.get(message.personalityId) ?? message.personalityId,
      content: message.content.replace(`${REACTION_PREFIX}\n`, "").trim(),
    })),
    synthesis: synthesisMessage ? synthesisMessage.content.replace(`${SUMMARY_PREFIX}\n`, "").trim() : null,
  }
}