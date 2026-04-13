import { getPersonalityById } from "./personalities.service.js"
import { generateChatCompletion } from "./llm.service.js"
import { addMessage, ensureSession, listSessionMessages } from "./sessions.service.js"
import { PERSONALITY_IDS } from "../utils/constants.js"

const MAX_CONTEXT_MESSAGES = 6

const PERSONALITY_FOCUS = {
  economist:
    "Enfatiza implicaciones economicas concretas: incentivos, costo-beneficio, impacto fiscal, productividad, competitividad territorial, inversion, empleo, externalidades y costos de transaccion.",
  politest:
    "Enfatiza viabilidad politico-institucional: actores, incentivos, gobernanza y riesgos de implementacion.",
  jurist:
    "Enfatiza legalidad y seguridad juridica: competencias, marco normativo, riesgos regulatorios y cautelas procedimentales.",
}

const PERSONALITY_VOICE = {
  economist: {
    roleTitle: "economista territorial y de politica publica",
    tone: "tecnico, sobrio, concreto y centrado en variables economicas",
    requiredStructure:
      "Si la pregunta es analitica: mecanismo economico, efectos sobre recursos/incentivos, impacto esperado y recomendacion. Si la pregunta es simple: definicion breve + implicacion economica especifica + una advertencia metodologica si corresponde.",
    avoid:
      "evita definiciones genericas; evita sonar como politologo o jurista; evita respuestas sin variables economicas concretas",
  },
  politest: {
    roleTitle: "estratega politico senior de gestion publica",
    tone: "estrategico, institucional y pragmatico",
    requiredStructure:
      "Si la pregunta es analitica: mapa de actores, riesgos de gobernabilidad, ruta de implementacion. Si la pregunta es simple: definicion breve + implicacion politica clave.",
    avoid:
      "evita respuestas abstractas sin actores, incentivos o viabilidad",
  },
  jurist: {
    roleTitle: "jurista senior en derecho publico e internacional",
    tone: "preciso, normativo y preventivo",
    requiredStructure:
      "Si la pregunta es analitica: marco normativo, riesgos legales, recomendacion de cumplimiento. Si la pregunta es simple: definicion breve + implicacion juridica clave.",
    avoid:
      "evita afirmaciones legales absolutas sin cautelas o condiciones",
  },
}

function buildContext(messages) {
  const contextSlice = messages.slice(-MAX_CONTEXT_MESSAGES)
  const contextText = contextSlice
    .map((message) => {
      const speaker = message.role === "assistant" ? `${message.role} (${message.personalityId ?? "general"})` : message.role
      return `${speaker.toUpperCase()}: ${message.content}`
    })
    .join("\n")

  return {
    contextSlice,
    contextText,
  }
}

function buildIndividualResponse({ personality, userMessage, contextSize }) {
  return `No fue posible generar respuesta del modelo en este momento.\n\nConsulta recibida: "${userMessage}"\nPersonalidad: ${personality.name}\nContexto considerado: ${contextSize} mensajes recientes.\n\nPuedes reintentar en unos segundos.`
}

function buildSystemPrompt(personality) {
  const limits = Array.isArray(personality.thematicLimits) ? personality.thematicLimits : []
  const focusInstruction = PERSONALITY_FOCUS[personality.id] ?? "Mantener enfoque tecnico segun la personalidad."
  const voiceProfile = PERSONALITY_VOICE[personality.id]
  const economistAddendum =
    personality.id === PERSONALITY_IDS.ECONOMIST
      ? "Para la personalidad Economista, cada respuesta debe sonar como economia aplicada: usa conceptos como incentivos, costo de oportunidad, asignacion de recursos, productividad, inversion, externalidades, eficiencia y sostenibilidad fiscal cuando sea pertinente. Evita definiciones vacias o demasiado generales."
      : ""

  return [
    `Eres ${personality.name}.`,
    voiceProfile ? `Actua como ${voiceProfile.roleTitle}.` : "",
    `Rol: ${personality.roleDescription}`,
    `Estilo de respuesta: ${personality.styleGuide}`,
    voiceProfile ? `Tono requerido: ${voiceProfile.tone}.` : "",
    `Marco de analisis: ${personality.analysisFrame}`,
    `Tipo de argumentos: ${personality.argumentStyle}`,
    voiceProfile ? `Estructura requerida: ${voiceProfile.requiredStructure}` : "",
    voiceProfile ? `Evitar: ${voiceProfile.avoid}.` : "",
    `Instrucciones base: ${personality.baseInstructions}`,
    `Enfoque obligatorio: ${focusInstruction}`,
    economistAddendum,
    "Responde en espanol, en formato claro y orientado a consulta academica e institucional.",
    "Usa Markdown simple con titulos y listas para mejorar legibilidad.",
    "Responde directo al punto y evita relleno.",
    "No uses frases de relleno ni introducciones largas.",
    "No menciones que estas siguiendo prompts internos.",
    limits.length > 0 ? `Limites tematicos: ${limits.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function buildResponseGuidelines(userMessage) {
  return [
    "RESPONDE SIGUIENDO ESTAS REGLAS SEGÚN EL TIPO DE CONSULTA:",
    "",
    "1. Si es un SALUDO SIMPLE (Hola, Buenos días, Qué tal, etc.):",
    "   - Responde con máximo 40 palabras",
    "   - Sé cordial y breve",
    "   - Menciona tu rol en una sola frase",
    "   - Invita al usuario a formular una pregunta concreta",
    "   - Formato: ## Saludo / [párrafo breve] / ## Siguiente paso / [invitación]",
    "",
    "2. Si es una PREGUNTA INCOMPLETA o SIN SENTIDO:",
    "   - Pide aclaración de forma breve y amable",
    "   - Máximo 50 palabras",
    "   - Sugiere ejemplos de lo que podrías responder",
    "   - Formato: ## Necesito más contexto / [petición] / ## Por ejemplo / [ejemplos]",
    "",
    "3. Si es una PREGUNTA SIMPLE (qué es, define, explica algo concreto):",
    "   - Entrega definición breve (2-3 frases)",
    "   - Incluye máximo 3 bullets de implicaciones prácticas",
    "   - Máximo 120 palabras",
    "   - Formato: ## Respuesta breve / [definición] / ## Implicaciones clave / [bullets]",
    "",
    "4. Si es una PREGUNTA ANALÍTICA o COMPLEJA:",
    "   - Estructura: idea central, análisis, recomendación",
    "   - Objetivo: 180-260 palabras",
    "   - Formato: ## Idea central / [1 párrafo] / ## Análisis / [2-4 bullets] / ## Recomendación / [2-4 bullets]",
  ].join("\n")
}

function buildUserPrompt({ contextText, userMessage }) {
  const contextBlock = contextText || "SIN CONTEXTO PREVIO"
  const guidelines = buildResponseGuidelines(userMessage)

  return [
    "Contexto reciente de la sesion:",
    contextBlock,
    "",
    "Consulta actual del usuario:",
    userMessage,
    "",
    guidelines,
  ].join("\n")
}

export async function processIndividualChat({ sessionId, personalityId, message }) {
  const normalizedMessage = String(message ?? "").trim()
  if (!normalizedMessage) {
    const error = new Error("Message is required")
    error.statusCode = 400
    throw error
  }

  const personality = await getPersonalityById(personalityId)
  if (!personality) {
    const error = new Error("Invalid personalityId")
    error.statusCode = 400
    throw error
  }

  const session = await ensureSession(sessionId, "individual")

  const userMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: normalizedMessage,
    createdAt: new Date().toISOString(),
  }

  await addMessage(session.id, userMessage)

  const history = await listSessionMessages(session.id)
  const { contextSlice, contextText } = buildContext(history)

  const systemPrompt = buildSystemPrompt(personality)
  const userPrompt = buildUserPrompt({
    contextText,
    userMessage: normalizedMessage,
  })

  let assistantContent
  let usedFallback = false
  let providerModel = null

  try {
    const generation = await generateChatCompletion({
      systemPrompt,
      userPrompt,
      maxTokens: 300,
      temperature: 0.3,
    })
    assistantContent = generation.content
    providerModel = generation.model
  } catch (error) {
    usedFallback = true
    assistantContent = buildIndividualResponse({
      personality,
      userMessage: normalizedMessage,
      contextSize: contextSlice.length,
    })
    console.error("LLM generation failed", {
      sessionId: session.id,
      personalityId,
      error: error?.message,
      code: error?.code,
    })
  }

  const assistantMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: assistantContent,
    createdAt: new Date().toISOString(),
    personalityId,
  }

  const savedAssistantMessage = await addMessage(session.id, assistantMessage)

  return {
    sessionId: session.id,
    response: savedAssistantMessage,
    metadata: {
      personalityId,
      contextWindow: MAX_CONTEXT_MESSAGES,
      contextUsed: contextSlice.length,
      usedFallback,
      model: providerModel,
      personality: {
        analysisFrame: personality.analysisFrame,
        argumentStyle: personality.argumentStyle,
      },
    },
  }
}
