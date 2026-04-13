import { Button } from "@/shared/components/ui/button"
import type { Personality, PersonalityId } from "@/shared/types/personality"

interface PersonalitySelectorProps {
  personalities: Personality[]
  selectedPersonalityId: PersonalityId
  onSelect: (personalityId: PersonalityId) => void
  compact?: boolean
}

export function PersonalitySelector({ personalities, selectedPersonalityId, onSelect, compact = false }: PersonalitySelectorProps) {
  return (
    <div className={compact ? "grid gap-2 sm:grid-cols-3" : "grid gap-2 sm:grid-cols-3"}>
      {personalities.map((personality) => {
        const selected = selectedPersonalityId === personality.id

        return (
          <Button
            key={personality.id}
            type="button"
            variant={selected ? "default" : "outline"}
            className={
              compact
                ? "h-10 justify-start rounded-full px-4 text-sm"
                : "h-auto min-h-20 flex-col items-start gap-1 p-3 text-left"
            }
            onClick={() => onSelect(personality.id)}
          >
            <span className="text-sm font-semibold">{personality.name}</span>
            {!compact ? <span className="text-muted-foreground text-xs whitespace-normal">{personality.styleGuide}</span> : null}
          </Button>
        )
      })}
    </div>
  )
}
