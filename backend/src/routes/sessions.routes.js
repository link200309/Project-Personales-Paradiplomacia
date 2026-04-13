import { Router } from "express"

import {
  createSessionController,
  getComparativeSessionResultController,
  listSessionsController,
  getSessionMessagesController,
} from "../controllers/sessions.controller.js"

const sessionsRouter = Router()

sessionsRouter.post("/", createSessionController)
sessionsRouter.get("/", listSessionsController)
sessionsRouter.get("/:id/messages", getSessionMessagesController)
sessionsRouter.get("/:id/comparative", getComparativeSessionResultController)

export { sessionsRouter }
