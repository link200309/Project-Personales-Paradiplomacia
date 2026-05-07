import { sock, getMe } from "../client.js"
import { parseCommand, getHelpText, shouldRespond } from "../services/command.service.js"
import { processIndividualChat } from "../../services/chat.service.js"
import { env } from "../../config/env.js"

const BOT_GROUP_JID = env.BOT_GROUP_JID

export async function handleIncomingMessage(message) {
  try {
    const chatJid = message.key?.remoteJid
    const messageId = message.key?.id
    const messageText = message.message?.conversation || 
                      message.message?.extendedTextMessage?.text || 
                      ""
    const senderJid = message.key?.participant
    const pushName = message.pushName || "Unknown"

    if (!chatJid || !chatJid.endsWith("@g.us")) {
      return
    }

    if (BOT_GROUP_JID && chatJid !== BOT_GROUP_JID) {
      console.log(`[Bot] Mensaje de grupo no autorizado: ${chatJid}`)
      return
    }

    const shouldAnswer = shouldRespond(
      messageText,
      message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    )

    if (!shouldAnswer) {
      return
    }

    const bot = await getMe()
    const isFromBot = senderJid === bot?.id

    if (isFromBot) {
      return
    }

    console.log(`[Bot] Mensaje de ${pushName}: ${messageText}`)

    const parsed = parseCommand(messageText)
    
    let responseText

    if (parsed?.command === "ayuda") {
      responseText = getHelpText()
    } else if (parsed?.personalityId) {
      responseText = await handleIndividualCommand(parsed)
    } else if (parsed?.command === "compare") {
      responseText = await handleCompareCommand(parsed)
    } else {
      responseText = await handleDefaultCommand(messageText)
    }

    if (responseText) {
      await sendResponse(chatJid, responseText)
    }
  } catch (error) {
    console.error("[Bot] Error al procesar mensaje:", error)
  }
}

async function handleIndividualCommand(parsed) {
  const { personalityId, args } = parsed

  if (!args) {
    return "Por favor, escribe tu pregunta después del comando.\n\nEjemplo: !economista ¿Qué es la paradiplomacia?"
  }

  try {
    const result = await processIndividualChat({
      sessionId: `whatsapp-${Date.now()}`,
      personalityId,
      message: args,
      userId: "whatsapp-bot",
    })

    return formatResponse(result.response?.content || "No pude generar una respuesta.")
  } catch (error) {
    console.error("[Bot] Error en comando individual:", error)
    return "Hubo un error al procesar tu solicitud. Intenta de nuevo."
  }
}

async function handleCompareCommand(parsed) {
  const topic = parsed.args

  if (!topic) {
    return "Por favor, escribe el tema a analizar.\n\nEjemplo: !compare ¿Cómo afecta la paradiplomacia al desarrollo territorial?"
  }

  try {
    const economistResult = await processIndividualChat({
      sessionId: `compare-${Date.now()}-economist`,
      personalityId: "economist",
      message: topic,
      userId: "whatsapp-bot",
    })

    const politestResult = await processIndividualChat({
      sessionId: `compare-${Date.now()}-politest`,
      personalityId: "politest",
      message: topic,
      userId: "whatsapp-bot",
    })

    const juristResult = await processIndividualChat({
      sessionId: `compare-${Date.now()}-jurist`,
      personalityId: "jurist",
      message: topic,
      userId: "whatsapp-bot",
    })

    return `📊 *Análisis Comparado: ${topic}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*🤓 ECONOMISTA:*
${economistResult.response?.content || "Sin respuesta"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*🏛️ POLITÓLOGO:*
${politestResult.response?.content || "Sin respuesta"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*⚖️ JURISTA:*
${juristResult.response?.content || "Sin respuesta"}`
  } catch (error) {
    console.error("[Bot] Error en comparación:", error)
    return "Hubo un error al generar el análisis comparado. Intenta de nuevo."
  }
}

async function handleDefaultCommand(messageText) {
  try {
    const result = await processIndividualChat({
      sessionId: `whatsapp-${Date.now()}`,
      personalityId: "politest",
      message: messageText,
      userId: "whatsapp-bot",
    })

    return result.response?.content || "No pude generar una respuesta."
  } catch (error) {
    console.error("[Bot] Error en comando por defecto:", error)
    return `Hola 👋 Soy el asistente de Paradiplomacia IDEI.

Usa *!ayuda* para ver los comandos disponibles.`
  }
}

function formatResponse(content) {
  return content
}

async function sendResponse(groupJid, text) {
  if (!sock) {
    console.error("[Bot] Socket no inicializado")
    return
  }

  try {
    await sock.sendMessage(groupJid, { text })
    console.log("[Bot] Respuesta enviada")
  } catch (error) {
    console.error("[Bot] Error al enviar respuesta:", error)
  }
}

export function setBotGroup(jid) {
  console.log(`[Bot] Grupo configurado: ${jid}`)
}