const ApiError = require('../utils/ApiError')

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Admin access required')
  }
  next()
}

module.exports = requireAdmin
