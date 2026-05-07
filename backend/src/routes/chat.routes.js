import { Router } from "express"

import { chatComparativeController, chatIndividualController, chatIndividualStreamController, chatWhatsAppController } from "../controllers/chat.controller.js"
import { chatDebateController } from "../controllers/debate.controller.js"

const chatRouter = Router()

chatRouter.post("/individual", chatIndividualController)
chatRouter.post("/individual/stream", chatIndividualStreamController)
chatRouter.post("/comparative", chatComparativeController)
chatRouter.post("/whatsapp", chatWhatsAppController)
chatRouter.post("/debate", chatDebateController)

export { chatRouter }
