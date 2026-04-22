import { processComparativeChat } from "../services/comparison.service.js"
import { processIndividualChat, processIndividualChatStream } from "../services/chat.service.js"
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

export async function chatIndividualStreamController(req, res, next) {
  try {
    const { sessionId, personalityId, message } = req.body ?? {}

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`)
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    const result = await processIndividualChatStream({
      sessionId,
      personalityId,
      message,
      userId: req.currentUser.id,
      onToken: (token) => sendEvent("token", { token }),
    })

    sendEvent("done", result)
    res.end()
  } catch (error) {
    if (error.statusCode && !res.headersSent) {
      return fail(res, error.message, error.statusCode)
    }

    if (res.headersSent) {
      res.write(`event: error\n`)
      res.write(`data: ${JSON.stringify({ message: error.message ?? "Streaming failed" })}\n\n`)
      res.end()
      return
    }

    return next(error)
  }
}
