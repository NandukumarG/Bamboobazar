// Local dev fallback only — used when CORS_ORIGIN isn't set and we're not in
// production, so `npm run dev` keeps working out of the box for both Vite
// frontends without extra setup.
const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174']

const ApiError = require('../utils/ApiError')

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const configuredOrigins = parseOrigins(process.env.CORS_ORIGIN)

const allowedOrigins =
  configuredOrigins.length > 0
    ? configuredOrigins
    : process.env.NODE_ENV === 'production'
      ? []
      : DEFAULT_DEV_ORIGINS

const corsOptions = {
  origin: (origin, callback) => {
    // Requests with no Origin header (curl, server-to-server, health
    // checks) aren't subject to the browser's same-origin policy — allow
    // them through regardless of the allowlist.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new ApiError(403, `Origin ${origin} is not allowed by CORS`))
    }
  },
}

module.exports = corsOptions
