const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const orderModel = require('../../models/orderModel')
const orderItemModel = require('../../models/orderItemModel')
const paymentModel = require('../../models/paymentModel')

const ORDER_STATUSES = ['PENDING', 'PAID', 'CANCELLED']

const listOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.findAllOrders()
  res.json({ orders })
})

const getOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid order id')

  const order = await orderModel.findOrderById(id)
  if (!order) throw new ApiError(404, 'Order not found')

  const [items, payment] = await Promise.all([
    orderItemModel.findItemsByOrderId(id),
    paymentModel.findByOrderId(id),
  ])

  res.json({ order: { ...order, items, payment: payment || null } })
})

const updateOrderStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid order id')

  const { status } = req.body
  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, 'Validation failed', [
      `status must be one of ${ORDER_STATUSES.join(', ')}`,
    ])
  }

  const existing = await orderModel.findOrderById(id)
  if (!existing) throw new ApiError(404, 'Order not found')

  const order = await orderModel.updateStatus(id, status)
  res.json({ order })
})

module.exports = { listOrders, getOrder, updateOrderStatus }
