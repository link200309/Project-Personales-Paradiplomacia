import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import type { InteractionMode } from "@/app/store"
import type { Personality, PersonalityId } from "@/shared/types/personality"

interface ModeSelectionModalProps {
  open: boolean
  personalities: Personality[]
  onSelectMode: (mode: InteractionMode) => void
  onSelectIndividualPersonality: (personalityId: PersonalityId) => void
  onOpenChange: (open: boolean) => void
}

export function ModeSelectionModal({
  open,
  personalities,
  onSelectMode,
  onSelectIndividualPersonality,
  onOpenChange,
}: ModeSelectionModalProps) {
  const [step, setStep] = useState<"mode" | "individual">("mode")

  useEffect(() => {
    if (!open) {
      setStep("mode")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {step === "mode" ? "Crear nuevo chat" : "Elegir personalidad"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {step === "mode"
              ? "Selecciona el tipo de interacción que deseas"
              : "Elige con qué personalidad quieres iniciar esta conversación"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {step === "mode" ? (
            <>
              <button
                onClick={() => setStep("individual")}
                className="group relative rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-blue-500/10 p-2">
                    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m0-6a6 6 0 1112 0A6 6 0 015 9z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm sm:text-base">Chat individual</p>
                    <p className="text-xs text-muted-foreground mt-1">Conversa con una personalidad experta</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectMode("comparative")}
                className="group relative rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-purple-500/10 p-2">
                    <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm sm:text-base">Análisis comparativo</p>
                    <p className="text-xs text-muted-foreground mt-1">Compara perspectivas de 3 expertos simultáneamente</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectMode("debate")}
                className="group relative rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-amber-500/10 p-2">
                    <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm sm:text-base">Debate</p>
                    <p className="text-xs text-muted-foreground mt-1">Mesa redonda escrita con posturas, réplicas y síntesis final</p>
                  </div>
                </div>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("mode")}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  ← Volver
                </button>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Personalidades</span>
              </div>
              <div className="grid gap-2">
                {personalities.length > 0 ? (
                  personalities.map((personality) => (
                    <button
                      key={personality.id}
                      type="button"
                      onClick={() => onSelectIndividualPersonality(personality.id)}
                      className="group rounded-xl border border-border/70 bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm sm:text-base">{personality.name}</p>
                          <p className="text-xs leading-5 text-muted-foreground">{personality.styleGuide}</p>
                        </div>
                        <span className="rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                          Elegir
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                    No hay personalidades activas cargadas desde la base de datos.
                  </div>
                )}
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Selecciona una personalidad de la base de datos para iniciar el chat con ese interlocutor fijo.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
