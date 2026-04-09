import type { Personality } from "@/shared/types/personality"

const PERSONALITIES: Personality[] = [
  {
    id: "economist",
    name: "Economist",
    roleDescription: "Evaluates fiscal and productive impact of policy decisions.",
    styleGuide: "Evidence-driven, practical, and cost-aware.",
  },
  {
    id: "politest",
    name: "Politest",
    roleDescription: "Assesses political feasibility and institutional strategy.",
    styleGuide: "Strategic, actor-oriented, and negotiation-focused.",
  },
  {
    id: "jurist",
    name: "Jurist",
    roleDescription: "Interprets legal constraints and regulatory opportunities.",
    styleGuide: "Normative, precise, and rights-aware.",
  },
]

export async function getPersonalities(): Promise<Personality[]> {
  return Promise.resolve(PERSONALITIES)
}
