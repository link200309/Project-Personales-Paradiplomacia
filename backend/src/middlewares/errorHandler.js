export function errorHandler(error, _req, res, _next) {
  console.error("Unhandled server error", error)
  return res.status(500).json({
    message: "Unexpected server error",
  })
}
