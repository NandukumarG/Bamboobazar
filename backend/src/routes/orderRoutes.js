const router = require('express').Router()
const orderController = require('../controllers/orderController')
const authenticate = require('../middleware/authMiddleware')

router.use(authenticate)

router.post('/', orderController.createOrder)
router.get('/', orderController.listOrders)
router.get('/:id', orderController.getOrder)

module.exports = router
