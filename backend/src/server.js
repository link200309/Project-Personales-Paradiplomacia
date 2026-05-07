import { createApp } from "./app.js"
import { env } from "./config/env.js"
import { ensurePersonalitiesSeeded } from "./services/personalities.service.js"
import { initBot } from "./bot/client.js"

const app = createApp()

async function bootstrap() {
  await ensurePersonalitiesSeeded()

  if (env.BOT_GROUP_JID) {
    console.log("[Server] Iniciando bot de WhatsApp...")
    initBot().catch((err) => {
      console.error("[Server] Error al iniciar bot:", err.message)
    })
  }

  app.listen(env.PORT, () => {
    console.log(`Backend listening on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error)
  process.exit(1)
})
