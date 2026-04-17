import { Loader2, Send } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Textarea } from "@/shared/components/ui/textarea"

interface ChatComposerProps {
  mode: "individual" | "comparative" | "debate"
  value: string
  loading: boolean
  onChange: (nextValue: string) => void
  onSubmit: () => void
}

export function ChatComposer({ mode, value, loading, onChange, onSubmit }: ChatComposerProps) {
  return (
    <div className="grid gap-3 relative">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={mode === "individual" ? "Haz una pregunta al experto seleccionado..." : mode === "comparative" ? "Escribe un tema para análisis comparativo..." : "Plantea un tema para el debate entre expertos..."}
        className="min-h-14 pr-17 resize-none"
      />
      <div className="flex absolute right-3 top-3">
        <Button type="button" onClick={onSubmit} disabled={loading || !value.trim()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
