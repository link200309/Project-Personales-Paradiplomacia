import { Badge } from "@/shared/components/ui/badge"

export function Header() {
  return (
    <header className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:gap-4 sm:pb-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Paradiplomacy MVP</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Espacio de trabajo de política conversacional
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
          Consulta paradiplomacia desde una conversación guiada por perfiles disciplinares, con historial persistente, modo comparativo y mesa redonda de debate.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs sm:text-sm">
          React + TypeScript + shadcn/ui
        </Badge>
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs sm:text-sm">
          Sesiones persistentes
        </Badge>
      </div>
    </header>
  )
}
