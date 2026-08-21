const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { isPositiveInteger, isNonEmptyString } = require('../utils/validators')
const paymentService = require('../services/paymentService')

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  if (!isPositiveInteger(orderId)) {
    throw new ApiError(400, 'Validation failed', ['orderId must be a positive integer'])
  }

  const result = await paymentService.createRazorpayOrder({ orderId, user: req.user })
  res.status(201).json(result)
})

const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
  const errors = []

  if (!isPositiveInteger(orderId)) errors.push('orderId must be a positive integer')
  if (!isNonEmptyString(razorpayOrderId)) errors.push('razorpayOrderId is required')
  if (!isNonEmptyString(razorpayPaymentId)) errors.push('razorpayPaymentId is required')
  if (!isNonEmptyString(razorpaySignature)) errors.push('razorpaySignature is required')

  if (errors.length) throw new ApiError(400, 'Validation failed', errors)

  const { order, alreadyPaid } = await paymentService.verifyPayment({
    orderId,
    user: req.user,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  })

  res.json({
    message: alreadyPaid ? 'Order was already marked as paid' : 'Payment verified successfully',
    order: {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
    },
  })
})

const markPaymentFailed = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId } = req.body
  const errors = []

  if (!isPositiveInteger(orderId)) errors.push('orderId must be a positive integer')
  if (!isNonEmptyString(razorpayOrderId)) errors.push('razorpayOrderId is required')

  if (errors.length) throw new ApiError(400, 'Validation failed', errors)

  const payment = await paymentService.markPaymentFailed({
    orderId,
    user: req.user,
    razorpayOrderId,
  })

  res.json({ payment })
})

module.exports = { createRazorpayOrder, verifyPayment, markPaymentFailed }
