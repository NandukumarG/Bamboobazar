const router = require('express').Router()
const authenticate = require('../../middleware/authMiddleware')
const requireAdmin = require('../../middleware/adminMiddleware')

// Every route under /api/admin requires a valid JWT and the ADMIN role.
router.use(authenticate, requireAdmin)

router.use('/products', require('./productRoutes'))
router.use('/categories', require('./categoryRoutes'))
router.use('/orders', require('./orderRoutes'))
router.use('/dashboard', require('./dashboardRoutes'))

module.exports = router
