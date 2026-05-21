import { PERSONALITY_IDS } from "../../utils/constants.js"

export const BotCommand = {
  ECONOMIST: "economista",
  POLITOLOGO: "politologo",
  JURIST: "jurista",
  COMPARE: "compare",
  AYUDA: "ayuda",
}

export function parseCommand(messageText) {
  if (!messageText || typeof messageText !== "string") {
    return null
  }

  const text = messageText.trim()
  const lowerText = text.toLowerCase()
  
  for (const [name, cmd] of Object.entries(BotCommand)) {
    const commandPattern = new RegExp(`^!${cmd}(?:\\s+|$)`, "i")

    if (commandPattern.test(text)) {
      const rest = text.slice(cmd.length + 1).trim()
      return {
        command: cmd,
        args: rest,
        raw: messageText,
      }
    }
  }

  if (lowerText.includes("@bot")) {
    return {
      command: "mention",
      args: messageText,
      raw: messageText,
    }
  }

  return null
}

function getPersonalityIdFromCommand(cmd) {
  switch (cmd) {
    case BotCommand.ECONOMIST:
      return PERSONALITY_IDS.ECONOMIST
    case BotCommand.POLITOLOGO:
      return PERSONALITY_IDS.POLITEST
    case BotCommand.JURIST:
      return PERSONALITY_IDS.JURIST
    default:
      return null
  }
}

export function getHelpText() {
  return `📚 *Comandos disponibles*

• *!economista* - Respondo como Economista
• *!politologo* - Respondo como Politólogo  
• *!jurista* - Respondo como Jurista
• *!compare* - Análisis comparado de las 3 perspectivas
• *!ayuda* - Muestra este mensaje

_Ejemplo:_ !economista ¿Cómo afecta la paradiplomacia al desarrollo territorial?
_Ejemplo:_ !compare ¿Qué es la paradiplomacia?`
}

export function shouldRespond(messageText, mentionedJids) {
  if (!messageText) return false
  
  return parseCommand(messageText) !== null
}