import { Badge } from "@/shared/components/ui/badge"

export function Header() {
  return (
    <header className="flex flex-col gap-2 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">Paradiplomacy MVP</p>
        <h1 className="font-heading text-2xl font-semibold">Conversational Policy Workspace</h1>
      </div>
      <Badge variant="secondary" className="w-fit">
        React + TypeScript + shadcn/ui
      </Badge>
    </header>
  )
}
