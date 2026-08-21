const router = require('express').Router()
const paymentController = require('../controllers/paymentController')
const authenticate = require('../middleware/authMiddleware')

router.use(authenticate)

router.post('/create-order', paymentController.createRazorpayOrder)
router.post('/verify', paymentController.verifyPayment)
router.post('/failed', paymentController.markPaymentFailed)

module.exports = router
