import {
  getPersonalities,
  togglePersonalityActivation,
  updatePersonalityDefinition,
} from "../services/personalities.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function getPersonalitiesController(_req, res, next) {
  try {
    const personalities = await getPersonalities()
    return ok(res, { personalities })
  } catch (error) {
    return next(error)
  }
}

export async function updatePersonalityController(req, res, next) {
  try {
    const { id } = req.params
    const personality = await updatePersonalityDefinition(id, req.body ?? {}, req.currentUser.id)
    return ok(res, { personality })
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}

export async function togglePersonalityController(req, res, next) {
  try {
    const { id } = req.params
    const isActive = Boolean(req.body?.isActive)
    const personality = await togglePersonalityActivation(id, isActive)
    return ok(res, { personality })
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}
