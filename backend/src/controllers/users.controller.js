import {
  createManagedUser,
  getUsers,
  updateManagedUser,
} from "../services/users.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function getCurrentUserController(req, res) {
  if (!req.currentUser) {
    return fail(res, "Authentication required", 401)
  }

  return ok(res, { user: req.currentUser })
}

export async function listUsersController(_req, res, next) {
  try {
    const users = await getUsers()
    return ok(res, { users })
  } catch (error) {
    return next(error)
  }
}

export async function createUserController(req, res, next) {
  try {
    const user = await createManagedUser(req.body ?? {})
    return ok(res, { user }, 201)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}

export async function updateUserController(req, res, next) {
  try {
    const { id } = req.params
    const user = await updateManagedUser(id, req.body ?? {})
    return ok(res, { user })
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}