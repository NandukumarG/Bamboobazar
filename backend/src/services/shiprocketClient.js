const shiprocket = require('../config/shiprocket')
const ApiError = require('../utils/ApiError')

// Shiprocket login tokens are valid for 10 days; cache in memory and only
// re-authenticate once it's close to expiring.
let cachedToken = null
let cachedTokenExpiresAt = 0

const login = async () => {
  let response
  try {
    response = await fetch(`${shiprocket.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: shiprocket.email, password: shiprocket.password }),
    })
  } catch (err) {
    throw new ApiError(502, 'Unable to reach the courier service')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.token) {
    throw new ApiError(502, 'Unable to authenticate with the courier service')
  }

  cachedToken = data.token
  cachedTokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000
  return cachedToken
}

const getAuthToken = async () => {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken
  }
  return login()
}

// Thin wrapper over Shiprocket's REST API: attaches the bearer token and
// resolves against the configured base URL. Callers interpret the response
// body themselves since Shiprocket signals failure differently per endpoint
// (some via HTTP status, some via a status flag in a 200 body).
const shiprocketRequest = async (path, { method = 'GET', body } = {}) => {
  if (!shiprocket.email || !shiprocket.password) {
    throw new ApiError(503, 'Shipping is not configured')
  }

  const token = await getAuthToken()

  let response
  try {
    response = await fetch(`${shiprocket.baseUrl}/${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new ApiError(502, 'Unable to reach the courier service')
  }

  const data = await response.json().catch(() => null)
  return { ok: response.ok, data }
}

module.exports = { shiprocketRequest }
