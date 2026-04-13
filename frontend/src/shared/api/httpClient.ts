interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api"

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorPayload?.message ?? `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
