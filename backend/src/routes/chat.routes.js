import { Router } from "express"

import { chatComparativeController, chatIndividualController } from "../controllers/chat.controller.js"

const chatRouter = Router()

chatRouter.post("/individual", chatIndividualController)
chatRouter.post("/comparative", chatComparativeController)

export { chatRouter }
