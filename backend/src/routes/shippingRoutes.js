const router = require('express').Router()
const shippingController = require('../controllers/shippingController')
const authenticate = require('../middleware/authMiddleware')

router.use(authenticate)

router.get('/quote', shippingController.getQuote)

module.exports = router
