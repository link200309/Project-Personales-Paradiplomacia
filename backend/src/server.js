import { createApp } from "./app.js"
import { env } from "./config/env.js"
import { ensurePersonalitiesSeeded } from "./services/personalities.service.js"

const app = createApp()

async function bootstrap() {
  await ensurePersonalitiesSeeded()

  app.listen(env.PORT, () => {
    console.log(`Backend listening on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error)
  process.exit(1)
})
