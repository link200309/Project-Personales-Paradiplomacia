import { Router } from "express"

import { botRouter } from "./bot.routes.js"
import { chatRouter } from "./chat.routes.js"
import { personalitiesRouter } from "./personalities.routes.js"

const apiRouter = Router()

apiRouter.use("/bot", botRouter)
apiRouter.use("/chat", chatRouter)
apiRouter.use("/personalities", personalitiesRouter)

export { apiRouter }
