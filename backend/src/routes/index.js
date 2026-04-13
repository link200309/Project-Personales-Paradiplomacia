import { Router } from "express"

import { chatRouter } from "./chat.routes.js"
import { personalitiesRouter } from "./personalities.routes.js"
import { sessionsRouter } from "./sessions.routes.js"

const apiRouter = Router()

apiRouter.use("/chat", chatRouter)
apiRouter.use("/personalities", personalitiesRouter)
apiRouter.use("/sessions", sessionsRouter)

export { apiRouter }
