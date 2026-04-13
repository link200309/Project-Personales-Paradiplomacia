import { env } from "../config/env.js"

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function generateChatCompletion({
  systemPrompt,
  userPrompt,
  maxTokens = 600,
  temperature = 0.4,
}) {
  if (!env.GROQ_API_KEY) {
    const error = new Error("GROQ_API_KEY is not configured")
    error.code = "MISSING_API_KEY"
    throw error
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), env.LLM_TIMEOUT_MS)

  try {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      const providerMessage = payload?.error?.message ?? `Groq request failed with status ${response.status}`
      const error = new Error(providerMessage)
      error.code = "PROVIDER_ERROR"
      throw error
    }

    const payload = await response.json()
    const content = payload?.choices?.[0]?.message?.content

    if (!content || typeof content !== "string") {
      const error = new Error("Invalid LLM response payload")
      error.code = "INVALID_PROVIDER_RESPONSE"
      throw error
    }

    return {
      content: content.trim(),
      model: payload?.model ?? env.LLM_MODEL,
    }
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(`LLM request timed out after ${env.LLM_TIMEOUT_MS}ms`)
      timeoutError.code = "LLM_TIMEOUT"
      throw timeoutError
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
