const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { isNonEmptyString, isValidEmail, isPositiveInteger } = require('../utils/validators')
const orderService = require('../services/orderService')
const orderModel = require('../models/orderModel')
const orderItemModel = require('../models/orderItemModel')

const createOrder = asyncHandler(async (req, res) => {
  const { items, customerName, phone, email, address, city, state, pincode } = req.body
  const errors = []

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array')
  } else {
    items.forEach((item, index) => {
      if (!item || !isPositiveInteger(item.productId)) {
        errors.push(`items[${index}].productId must be a positive integer`)
      }
      if (!item || !isPositiveInteger(item.quantity)) {
        errors.push(`items[${index}].quantity must be a positive integer`)
      }
    })
  }
  if (!isNonEmptyString(customerName)) errors.push('customerName is required')
  if (!isNonEmptyString(phone)) errors.push('phone is required')
  if (!isValidEmail(email)) errors.push('a valid email is required')
  if (!isNonEmptyString(address)) errors.push('address is required')
  if (!isNonEmptyString(city)) errors.push('city is required')
  if (!isNonEmptyString(state)) errors.push('state is required')
  if (!isNonEmptyString(pincode)) errors.push('pincode is required')

  if (errors.length) throw new ApiError(400, 'Validation failed', errors)

  const order = await orderService.createOrder({
    userId: req.user.id,
    items,
    customerName,
    phone,
    email,
    address,
    city,
    state,
    pincode,
  })

  res.status(201).json({ order })
})

const listOrders = asyncHandler(async (req, res) => {
  const orders =
    req.user.role === 'ADMIN'
      ? await orderModel.findAllOrders()
      : await orderModel.findOrdersByUser(req.user.id)

  res.json({ orders })
})

const getOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid order id')

  const order = await orderModel.findOrderById(id)
  if (!order) throw new ApiError(404, 'Order not found')

  if (req.user.role !== 'ADMIN' && order.user_id !== req.user.id) {
    throw new ApiError(403, 'You do not have access to this order')
  }

  const items = await orderItemModel.findItemsByOrderId(order.id)
  res.json({ order: { ...order, items } })
})

module.exports = { createOrder, listOrders, getOrder }
