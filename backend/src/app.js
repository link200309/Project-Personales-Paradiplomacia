import cors from "cors"
import express from "express"

import { env } from "./config/env.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { resolveUserMiddleware } from "./middlewares/resolveUser.js"
import { apiRouter } from "./routes/index.js"

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
    })
  )
  app.use(express.json())

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" })
  })

  app.use(resolveUserMiddleware)
  app.use("/api", apiRouter)
  app.use(errorHandler)

  return app
}
