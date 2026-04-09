export function normalizeResponse(content: string): string {
  return content.trim().replace(/\s+/g, " ")
}
