import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RichTextResponse } from "@/shared/components/RichTextResponse"
import type { ComparativeResult } from "@/shared/types/chat"

interface ComparisonPanelProps {
  result: ComparativeResult | null
}

const personalityColors: Record<string, string> = {
  economist: "border-l-4 border-l-teal-600",
  politest: "border-l-4 border-l-amber-600",
  jurist: "border-l-4 border-l-rose-600",
}

export function ComparisonPanel({ result }: ComparisonPanelProps) {
  if (!result) {
    return (
      <Card className="overflow-hidden border-dashed border-border/70 bg-background/75">
        <CardHeader className="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-amber-500/5">
          <div className="absolute right-4 top-4 size-16 rounded-full bg-primary/10 blur-2xl" />
          <CardTitle className="text-base sm:text-lg">Análisis comparativo</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Envía un tema para ver tres perspectivas diferenciadas y una síntesis final opcional.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 py-6 sm:grid-cols-3">
          {[
            { title: "Economista", description: "Impacto, incentivos y costo-beneficio." },
            { title: "Politest", description: "Gobernanza, actores y viabilidad política." },
            { title: "Jurista", description: "Competencias, límites y seguridad jurídica." },
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
        {result.responses.map((response) => (
          <Card key={response.personalityId} className={`overflow-hidden border-border/70 shadow-sm ${personalityColors[response.personalityId]}`}>
            <CardHeader className="border-b border-border/60 bg-muted/30">
              <CardTitle className="flex items-center justify-between gap-2 text-sm sm:text-base">
                <span>{response.personalityName}</span>
                <span className="rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Respuesta
                </span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Respuesta disciplinar independiente</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <RichTextResponse content={response.content} />
            </CardContent>
          </Card>
        ))}
      </div>

      {result.optionalSummary ? (
        <Card className="response-highlight overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/40 via-background to-amber-500/10">
            <CardTitle className="text-base sm:text-lg">Síntesis institucional</CardTitle>
            <CardDescription className="text-sm">Resumen opcional de convergencias y diferencias</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <RichTextResponse content={result.optionalSummary} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
