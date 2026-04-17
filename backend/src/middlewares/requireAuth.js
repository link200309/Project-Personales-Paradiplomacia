import { fail } from "../utils/responseHelpers.js"

export function requireAuthMiddleware(req, res, next) {
  if (!req.currentUser) {
    return fail(res, "Authentication required", 401)
  }

  return next()
}
