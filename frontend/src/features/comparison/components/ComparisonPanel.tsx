import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
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
      <Card>
        <CardHeader>
          <CardTitle>Comparative analysis</CardTitle>
          <CardDescription>Submit a topic to get three differentiated expert viewpoints.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {result.responses.map((response) => (
          <Card key={response.personalityId} className={personalityColors[response.personalityId]}>
            <CardHeader>
              <CardTitle>{response.personalityName}</CardTitle>
              <CardDescription>Independent response</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6">{response.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {result.optionalSummary ? (
        <Card className="response-highlight">
          <CardHeader>
            <CardTitle>Institutional summary</CardTitle>
            <CardDescription>Optional synthesis of convergence and divergence</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6">{result.optionalSummary}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
