import { resolveUser } from "../services/users.service.js"

export async function resolveUserMiddleware(req, _res, next) {
  try {
    const headerUserId = req.header("x-user-id")

    const resolved = await resolveUser({
      userId: headerUserId,
    })

    if (resolved) {
      req.currentUser = resolved
    } else {
      req.currentUser = null
    }

    return next()
  } catch (error) {
    return next(error)
  }
}