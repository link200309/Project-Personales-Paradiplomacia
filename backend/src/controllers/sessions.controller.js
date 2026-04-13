import { createNewSession, listRecentSessions, listSessionMessages } from "../services/sessions.service.js"
import { getComparativeResultBySessionId } from "../services/comparison.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function createSessionController(req, res, next) {
  try {
    const mode = req.body?.mode ?? "individual"
    const session = await createNewSession(mode)
    return ok(res, { sessionId: session.id, mode: session.mode, createdAt: session.createdAt }, 201)
  } catch (error) {
    return next(error)
  }
}

export async function getSessionMessagesController(req, res, next) {
  try {
    const { id } = req.params
    if (!id) {
      return fail(res, "Session id is required", 400)
    }

    const messages = await listSessionMessages(id)
    return ok(res, { messages })
  } catch (error) {
    return next(error)
  }
}

export async function listSessionsController(_req, res, next) {
  try {
    const sessions = await listRecentSessions()
    return ok(res, { sessions })
  } catch (error) {
    return next(error)
  }
}

export async function getComparativeSessionResultController(req, res, next) {
  try {
    const { id } = req.params
    if (!id) {
      return fail(res, "Session id is required", 400)
    }

    const result = await getComparativeResultBySessionId(id)
    return ok(res, result)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}
