import cors from "cors"
import express from "express"

import { env } from "./config/env.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { apiRouter } from "./routes/index.js"
import { getConnectionStatus, getQRDataURL } from "./bot/client.js"

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

  app.get("/qr", (_req, res) => {
    const status = getConnectionStatus()
    const qrDataURL = getQRDataURL()

    if (status.isConnected) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paradiplomacia Bot - Conectado</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: green; font-size: 24px; }
            .btn { margin-top: 20px; padding: 10px 20px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1 class="success">✅ Bot Conectado a WhatsApp</h1>
          <p>El bot está activo y esperando mensajes en el grupo.</p>
          <button class="btn" onclick="location.reload()">Recargar</button>
        </body>
        </html>
      `)
      return
    }

    if (!qrDataURL) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paradiplomacia Bot - QR</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #666; }
          </style>
        </head>
        <body>
          <h1>⏳ Esperando QR...</h1>
          <p>Inicia el servidor si no ves el código QR.</p>
          <script>setTimeout(() => location.reload(), 3000)</script>
        </body>
        </html>
      `)
      return
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Paradiplomacia Bot -QR</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { background: white; padding: 30px; border-radius: 10px; display: inline-block; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; }
          img { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📱 Escanea el QR con WhatsApp</h1>
          <p>Abre WhatsApp → Ajustes → Dispositivos vinculados</p>
          <img src="${qrDataURL}" alt="QR Code" />
          <p>O ingresa a <a href="http://localhost:3001/qr">http://localhost:3001/qr</a></p>
          <script>setTimeout(() => location.reload(), 10000)</script>
        </div>
      </body>
      </html>
    `)
  })

  app.use("/api", apiRouter)
  app.use(errorHandler)

  return app
}
