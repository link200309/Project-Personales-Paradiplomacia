import { Router } from "express"

import {
  createSessionController,
  getComparativeSessionResultController,
  getDebateSessionResultController,
  listSessionsController,
  getSessionMessagesController,
} from "../controllers/sessions.controller.js"

const sessionsRouter = Router()

sessionsRouter.post("/", createSessionController)
sessionsRouter.get("/", listSessionsController)
sessionsRouter.get("/:id/messages", getSessionMessagesController)
sessionsRouter.get("/:id/comparative", getComparativeSessionResultController)
sessionsRouter.get("/:id/debate", getDebateSessionResultController)

export { sessionsRouter }
