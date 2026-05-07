import { Router } from "express"

import { chatIndividualController, chatWhatsAppController } from "../controllers/chat.controller.js"

const chatRouter = Router()

chatRouter.post("/individual", chatIndividualController)
chatRouter.post("/whatsapp", chatWhatsAppController)

export { chatRouter }
