import { Router } from "express"

import { chatComparativeController, chatIndividualController, chatIndividualStreamController } from "../controllers/chat.controller.js"
import { chatDebateController } from "../controllers/debate.controller.js"

const chatRouter = Router()

chatRouter.post("/individual", chatIndividualController)
chatRouter.post("/individual/stream", chatIndividualStreamController)
chatRouter.post("/comparative", chatComparativeController)
chatRouter.post("/debate", chatDebateController)

export { chatRouter }
