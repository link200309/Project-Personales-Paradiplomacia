import { processDebateChat } from "../services/debate.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function chatDebateController(req, res, next) {
  try {
    const { sessionId, message, personalityIds } = req.body ?? {}
    const result = await processDebateChat({
      sessionId,
      message,
      personalityIds,
      userId: req.currentUser.id,
    })
    return ok(res, result)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}