import { getPersonalities } from "../services/personalities.service.js"
import { ok } from "../utils/responseHelpers.js"

export async function getPersonalitiesController(_req, res, next) {
  try {
    const personalities = await getPersonalities()
    return ok(res, { personalities })
  } catch (error) {
    return next(error)
  }
}
