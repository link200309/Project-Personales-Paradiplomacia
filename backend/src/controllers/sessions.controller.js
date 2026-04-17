import { createNewSession, listRecentSessions, listSessionMessages } from "../services/sessions.service.js"
import { getComparativeResultBySessionId } from "../services/comparison.service.js"
import { getDebateResultBySessionId } from "../services/debate.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function createSessionController(req, res, next) {
  try {
    const mode = req.body?.mode ?? "individual"
    const personalityId = req.body?.personalityId ?? null
    const session = await createNewSession(mode, req.currentUser.id, personalityId)
    return ok(
      res,
      {
        sessionId: session.id,
        mode: session.mode,
        personalityId: session.personalityId ?? null,
        title: session.title ?? null,
        createdAt: session.createdAt,
      },
      201
    )
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

    const messages = await listSessionMessages(id, req.currentUser.id)
    return ok(res, { messages })
  } catch (error) {
    return next(error)
  }
}

export async function listSessionsController(req, res, next) {
  try {
    const sessions = await listRecentSessions(req.currentUser.id)
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

    const result = await getComparativeResultBySessionId(id, req.currentUser.id)
    return ok(res, result)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}

export async function getDebateSessionResultController(req, res, next) {
  try {
    const { id } = req.params
    if (!id) {
      return fail(res, "Session id is required", 400)
    }

    const result = await getDebateResultBySessionId(id, req.currentUser.id)
    return ok(res, result)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}
