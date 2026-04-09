import { Button } from "@/shared/components/ui/button"
import type { Personality, PersonalityId } from "@/shared/types/personality"

interface PersonalitySelectorProps {
  personalities: Personality[]
  selectedPersonalityId: PersonalityId
  onSelect: (personalityId: PersonalityId) => void
}

export function PersonalitySelector({ personalities, selectedPersonalityId, onSelect }: PersonalitySelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {personalities.map((personality) => {
        const selected = selectedPersonalityId === personality.id

        return (
          <Button
            key={personality.id}
            type="button"
            variant={selected ? "default" : "outline"}
            className="h-auto min-h-20 flex-col items-start gap-1 p-3 text-left"
            onClick={() => onSelect(personality.id)}
          >
            <span className="text-sm font-semibold">{personality.name}</span>
            <span className="text-muted-foreground text-xs whitespace-normal">{personality.styleGuide}</span>
          </Button>
        )
      })}
    </div>
  )
}
