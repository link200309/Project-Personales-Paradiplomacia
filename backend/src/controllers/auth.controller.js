import { signInUser, signUpUser } from "../services/users.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function signUpController(req, res, next) {
  try {
    const user = await signUpUser(req.body ?? {})
    return ok(res, { user }, 201)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}

export async function signInController(req, res, next) {
  try {
    const user = await signInUser(req.body ?? {})
    return ok(res, { user })
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}
