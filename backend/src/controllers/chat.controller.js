import { processComparativeChat } from "../services/comparison.service.js"
import { processIndividualChat } from "../services/chat.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function chatIndividualController(req, res, next) {
  try {
    const { sessionId, personalityId, message } = req.body ?? {}
    const result = await processIndividualChat({
      sessionId,
      personalityId,
      message,
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

export async function chatComparativeController(req, res, next) {
  try {
    const { sessionId, message, personalityIds } = req.body ?? {}
    const result = await processComparativeChat({
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
