const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { verifyToken } = require('../utils/jwt')

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token missing')
  }

  const token = header.split(' ')[1]

  try {
    const decoded = verifyToken(token)
    req.user = { id: decoded.id, role: decoded.role }
    next()
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token')
  }
})

module.exports = authenticate
