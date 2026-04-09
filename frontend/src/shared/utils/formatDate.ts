export function formatDate(value: string): string {
  const date = new Date(value)

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
