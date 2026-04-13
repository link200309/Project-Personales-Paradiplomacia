export function ok(res, payload, status = 200) {
  return res.status(status).json(payload)
}

export function fail(res, message, status = 400) {
  return res.status(status).json({ message })
}
