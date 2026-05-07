import { Router } from "express"

import { connectBot, getConnectionStatus, disconnectBot } from "../bot/client.js"

const botRouter = Router()

botRouter.post("/connect", async (_req, res, next) => {
  try {
    const bot = await connectBot()
    const status = getConnectionStatus()
    
    res.json({
      success: true,
      message: "Conectando a WhatsApp...",
      status,
    })
  } catch (error) {
    next(error)
  }
})

botRouter.get("/status", (_req, res) => {
  const status = getConnectionStatus()
  
  res.json({
    success: true,
    status,
  })
})

botRouter.post("/disconnect", async (_req, res, next) => {
  try {
    await disconnectBot()
    
    res.json({
      success: true,
      message: "Bot desconectado",
    })
  } catch (error) {
    next(error)
  }
})

export { botRouter }