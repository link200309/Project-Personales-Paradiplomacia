import { Router } from "express"

import { requireAuthMiddleware } from "../middlewares/requireAuth.js"
import { authRouter } from "./auth.routes.js"
import { chatRouter } from "./chat.routes.js"
import { documentsRouter } from "./documents.routes.js"
import { personalitiesRouter } from "./personalities.routes.js"
import { sessionsRouter } from "./sessions.routes.js"
import { usersRouter } from "./users.routes.js"

const apiRouter = Router()

apiRouter.use("/auth", authRouter)
apiRouter.use(requireAuthMiddleware)
apiRouter.use("/chat", chatRouter)
apiRouter.use("/personalities", personalitiesRouter)
apiRouter.use("/sessions", sessionsRouter)
apiRouter.use("/documents", documentsRouter)
apiRouter.use("/users", usersRouter)

export { apiRouter }
