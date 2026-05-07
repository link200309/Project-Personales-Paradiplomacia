import { processIndividualChat, processWhatsAppChat } from "../services/chat.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function chatIndividualController(req, res, next) {
  try {
    const { sessionId, personalityId, message } = req.body ?? {}
    const result = await processIndividualChat({
      sessionId,
      personalityId,
      message,
      userId: "web-user",
    })
    return ok(res, result)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }
    return next(error)
  }
}

export async function chatWhatsAppController(req, res, next) {
  try {
    const { sessionId, personalityId, message, groupId, messageId } = req.body ?? {}
    
    const result = await processWhatsAppChat({
      sessionId,
      personalityId,
      message,
      groupId,
      messageId,
      userId: "whatsapp-bot",
    })
    
    return ok(res, result)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }
    return next(error)
  }
}