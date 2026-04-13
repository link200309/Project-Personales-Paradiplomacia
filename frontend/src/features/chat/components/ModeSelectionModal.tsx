import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import type { InteractionMode } from "@/app/store"

interface ModeSelectionModalProps {
  open: boolean
  onSelect: (mode: InteractionMode) => void
}

export function ModeSelectionModal({ open, onSelect }: ModeSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && null}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Crear nuevo chat</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Selecciona el tipo de interacción que deseas
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {/* Individual Chat */}
          <button
            onClick={() => onSelect("individual")}
            className="group relative rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-blue-500/10 p-2">
                <svg
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                <p className="text-xs text-muted-foreground mt-1">
                  Conversa con una personalidad experta
                </p>
              </div>
            </div>
          </button>

          {/* Comparative Analysis */}
          <button
            onClick={() => onSelect("comparative")}
            className="group relative rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-purple-500/10 p-2">
                <svg
                  className="h-5 w-5 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                <p className="text-xs text-muted-foreground mt-1">
                  Compara perspectivas de 3 expertos simultáneamente
                </p>
              </div>
            </div>
          </button>

          {/* Debate (Disabled) */}
          <button
            disabled
            className="group relative rounded-xl border border-border/40 bg-muted p-4 transition-all opacity-60 cursor-not-allowed"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-amber-500/10 p-2">
                <svg
                  className="h-5 w-5 text-amber-500/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm sm:text-base text-muted-foreground">Debate</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Próximamente: Debate entre expertos
                </p>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
