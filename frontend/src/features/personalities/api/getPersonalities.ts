import { httpClient } from "@/shared/api/httpClient"
import type { Personality } from "@/shared/types/personality"

interface PersonalitiesApiResponse {
  personalities: Personality[]
}

export async function getPersonalities(): Promise<Personality[]> {
  const response = await httpClient<PersonalitiesApiResponse>("/personalities")
  return response.personalities
}
