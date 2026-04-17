import { Router } from "express"

import { chatComparativeController, chatIndividualController } from "../controllers/chat.controller.js"
import { chatDebateController } from "../controllers/debate.controller.js"

const chatRouter = Router()

chatRouter.post("/individual", chatIndividualController)
chatRouter.post("/comparative", chatComparativeController)
chatRouter.post("/debate", chatDebateController)

export { chatRouter }
