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

  const text = messageText.trim().toLowerCase()
  
  for (const [name, cmd] of Object.entries(BotCommand)) {
    if (text.startsWith(`!${cmd}`)) {
      const rest = text.slice(cmd.length + 1).trim()
      return {
        command: cmd,
        personalityId: getPersonalityIdFromCommand(cmd),
        args: rest,
        raw: messageText,
      }
    }
  }

  if (text.includes("@bot") || text.startsWith("hola")) {
    return {
      command: "mention",
      personalityId: null,
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
  
  const text = messageText.toLowerCase()
  
  if (text.includes("@bot")) return true
  
  for (const cmd of Object.values(BotCommand)) {
    if (text.startsWith(`!${cmd}`)) return true
  }
  
  return false
}