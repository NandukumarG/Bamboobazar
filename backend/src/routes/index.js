const router = require('express').Router()

router.use('/auth', require('./authRoutes'))
router.use('/products', require('./productRoutes'))
router.use('/categories', require('./categoryRoutes'))
router.use('/orders', require('./orderRoutes'))
router.use('/admin', require('./admin'))

module.exports = router
