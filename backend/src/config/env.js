import "dotenv/config"

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  GROQ_API_KEY: process.env.GROQ_API_KEY ?? "",
  LLM_MODEL: process.env.LLM_MODEL ?? "llama-3.3-70b-versatile",
  LLM_TIMEOUT_MS: Number(process.env.LLM_TIMEOUT_MS ?? 20000),
}
