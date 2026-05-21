import { sock, getMe } from "../client.js"
import { parseCommand, getHelpText, shouldRespond } from "../services/command.service.js"
import { processWhatsAppChat } from "../../services/chat.service.js"
import { env } from "../../config/env.js"

const BOT_GROUP_JID = env.BOT_GROUP_JID
const BOT_USER_ID = "whatsapp-bot"

const COMMAND_TO_PERSONALITY = {
  economista: "economist",
  politologo: "politest",
  jurista: "jurist",
}

function makeStableSessionId(groupJid, suffix) {
  return `whatsapp-${groupJid}-${suffix}`.replace(/[^a-zA-Z0-9_-]+/g, "-")
}

async function runPersonaCommand({ groupJid, command, args, messageId }) {
  const personalityId = COMMAND_TO_PERSONALITY[command]

  if (!personalityId) {
    return null
  }

  if (!args) {
    return `Por favor, escribe tu pregunta después del comando.\n\nEjemplo: !${command} ¿Qué es la paradiplomacia?`
  }

  const result = await processWhatsAppChat({
    sessionId: makeStableSessionId(groupJid, personalityId),
    personalityId,
    message: args,
    groupId: groupJid,
    messageId,
    userId: BOT_USER_ID,
  })

  return result.response?.content || "No pude generar una respuesta."
}

async function runCompareCommand({ groupJid, args, messageId }) {
  if (!args) {
    return "Por favor, escribe el tema a analizar.\n\nEjemplo: !compare ¿Cómo afecta la paradiplomacia al desarrollo territorial?"
  }

  const [economistResult, politestResult, juristResult] = await Promise.all([
    processWhatsAppChat({
      sessionId: makeStableSessionId(groupJid, "compare-economist"),
      personalityId: "economist",
      message: args,
      groupId: groupJid,
      messageId,
      userId: BOT_USER_ID,
    }),
    processWhatsAppChat({
      sessionId: makeStableSessionId(groupJid, "compare-politest"),
      personalityId: "politest",
      message: args,
      groupId: groupJid,
      messageId,
      userId: BOT_USER_ID,
    }),
    processWhatsAppChat({
      sessionId: makeStableSessionId(groupJid, "compare-jurist"),
      personalityId: "jurist",
      message: args,
      groupId: groupJid,
      messageId,
      userId: BOT_USER_ID,
    }),
  ])

  return `📊 *Análisis Comparado: ${args}*\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*🤓 ECONOMISTA:*\n${economistResult.response?.content || "Sin respuesta"}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*🏛️ POLITÓLOGO:*\n${politestResult.response?.content || "Sin respuesta"}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*⚖️ JURISTA:*\n${juristResult.response?.content || "Sin respuesta"}`
}

async function handleDefaultCommand(messageText, groupJid, messageId) {
  const result = await processWhatsAppChat({
    sessionId: makeStableSessionId(groupJid, "politest-default"),
    personalityId: "politest",
    message: messageText,
    groupId: groupJid,
    messageId,
    userId: BOT_USER_ID,
  })

  return result.response?.content || "No pude generar una respuesta."
}

export async function handleIncomingMessage(message) {
  try {
    const chatJid = message.key?.remoteJid
    const messageId = message.key?.id
    const messageText =
      message.message?.conversation ||
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

    if (!shouldRespond(messageText)) {
      return
    }

    const bot = await getMe()
    const isFromBot = senderJid === bot?.id

    if (isFromBot) {
      return
    }

    console.log(`[Bot] Mensaje de ${pushName}: ${messageText}`)

    const parsed = parseCommand(messageText)
    let responseText = null

    if (parsed?.command === "ayuda") {
      responseText = getHelpText()
    } else if (parsed?.command === "compare") {
      responseText = await runCompareCommand({
        groupJid: chatJid,
        args: parsed.args,
        messageId,
      })
    } else if (parsed?.command && COMMAND_TO_PERSONALITY[parsed.command]) {
      responseText = await runPersonaCommand({
        groupJid: chatJid,
        command: parsed.command,
        args: parsed.args,
        messageId,
      })
    } else if (messageText.toLowerCase().includes("@bot")) {
      responseText = await handleDefaultCommand(messageText, chatJid, messageId)
    }

    if (responseText) {
      await sendResponse(chatJid, responseText)
    }
  } catch (error) {
    console.error("[Bot] Error al procesar mensaje:", error)
  }
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