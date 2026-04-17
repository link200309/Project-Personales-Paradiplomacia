import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RichTextResponse } from "@/shared/components/RichTextResponse"
import type { DebateResult } from "@/shared/types/chat"

interface DebatePanelProps {
  result: DebateResult | null
}

const personalityColors: Record<string, string> = {
  economist: "border-l-4 border-l-teal-600",
  politest: "border-l-4 border-l-amber-600",
  jurist: "border-l-4 border-l-rose-600",
}

export function DebatePanel({ result }: DebatePanelProps) {
  if (!result) {
    return (
      <Card className="overflow-hidden border-dashed border-border/70 bg-background/75">
        <CardHeader className="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-amber-500/8 via-transparent to-primary/5">
          <div className="absolute right-4 top-4 size-16 rounded-full bg-amber-500/10 blur-2xl" />
          <CardTitle className="text-base sm:text-lg">Debate estructurado</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Envía un tema para ver posturas iniciales, réplicas disciplinares y una síntesis final.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 py-6 sm:grid-cols-3">
          {[
            { title: "Posturas iniciales", description: "Cada experto presenta su tesis disciplinar." },
            { title: "Réplicas", description: "Cada voz responde a los argumentos de las otras." },
            { title: "Síntesis", description: "Moderación final con coincidencias y tensiones." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {result.initialPositions.map((position) => (
          <Card key={position.personalityId} className={`overflow-hidden border-border/70 shadow-sm ${personalityColors[position.personalityId]}`}>
            <CardHeader className="border-b border-border/60 bg-muted/30">
              <CardTitle className="flex items-center justify-between gap-2 text-sm sm:text-base">
                <span>{position.personalityName}</span>
                <span className="rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Inicial
                </span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tesis de apertura</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <RichTextResponse content={position.content} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {result.reactions.map((reaction) => (
          <Card key={reaction.personalityId} className={`overflow-hidden border-border/70 shadow-sm ${personalityColors[reaction.personalityId]}`}>
            <CardHeader className="border-b border-border/60 bg-muted/20">
              <CardTitle className="flex items-center justify-between gap-2 text-sm sm:text-base">
                <span>{reaction.personalityName}</span>
                <span className="rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Réplica
                </span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Respuesta al intercambio</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <RichTextResponse content={reaction.content} />
            </CardContent>
          </Card>
        ))}
      </div>

      {result.synthesis ? (
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/40 via-background to-amber-500/10">
            <CardTitle className="text-base sm:text-lg">Síntesis final</CardTitle>
            <CardDescription className="text-sm">Cierre del debate con convergencias, tensiones y lectura institucional</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <RichTextResponse content={result.synthesis} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}