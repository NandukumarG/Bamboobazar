const ApiError = require('../utils/ApiError')

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`))
}

const errorHandler = (err, req, res, next) => {
  // Postgres unique / foreign-key violations map to clean 4xx responses
  // instead of falling through to a generic 500 with a raw SQL message.
  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with this value already exists.' })
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Invalid reference: related record does not exist.' })
  }

  const isKnownError = err instanceof ApiError
  const statusCode = isKnownError ? err.statusCode : 500
  // Unexpected errors (DB failures, etc.) are logged in full but never sent
  // to the client — only deliberate ApiErrors expose their message.
  const message = isKnownError ? err.message : 'Internal server error'

  if (!isKnownError) {
    console.error(err)
  }

  res.status(statusCode).json({
    message,
    errors: isKnownError && err.errors.length ? err.errors : undefined,
  })
}

module.exports = { notFound, errorHandler }
