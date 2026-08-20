const router = require('express').Router()
const orderController = require('../../controllers/admin/orderController')

router.get('/', orderController.listOrders)
router.get('/:id', orderController.getOrder)
router.patch('/:id/status', orderController.updateOrderStatus)

module.exports = router
