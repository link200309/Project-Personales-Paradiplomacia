export type PersonalityId = "economist" | "politest" | "jurist"

export interface Personality {
  id: PersonalityId
  name: string
  roleDescription: string
  styleGuide: string
}
