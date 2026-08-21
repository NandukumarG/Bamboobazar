const crypto = require('crypto')
const pool = require('../config/db')
const razorpay = require('../config/razorpay')
const orderModel = require('../models/orderModel')
const orderItemModel = require('../models/orderItemModel')
const productModel = require('../models/productModel')
const paymentModel = require('../models/paymentModel')
const ApiError = require('../utils/ApiError')

const toPaise = (amount) => Math.round(Number(amount) * 100)

const getOwnedOrder = async (orderId, user) => {
  const order = await orderModel.findOrderById(orderId)
  if (!order) throw new ApiError(404, 'Order not found')
  if (user.role !== 'ADMIN' && order.user_id !== user.id) {
    throw new ApiError(403, 'You do not have access to this order')
  }
  return order
}

// Prices are trusted from PostgreSQL only. An order's line-item prices are
// snapshotted at order-creation time; re-check them against the live catalog
// before ever creating a Razorpay order, in case a price changed in the gap
// between checkout and payment (e.g. an admin edit).
const assertPricesUnchanged = async (order) => {
  const items = await orderItemModel.findItemsByOrderId(order.id)

  for (const item of items) {
    if (!item.product_id) continue // product was deleted since the order was placed
    const product = await productModel.findById(item.product_id)
    if (!product) continue

    if (Number(product.selling_price) !== Number(item.price)) {
      throw new ApiError(
        409,
        `The price of "${item.product_name}" has changed since this order was placed. Please place a new order.`
      )
    }
  }
}

const createRazorpayOrder = async ({ orderId, user }) => {
  if (!razorpay) {
    throw new ApiError(500, 'Payments are not configured on this server yet')
  }

  const order = await getOwnedOrder(orderId, user)

  if (order.payment_method === 'COD') {
    throw new ApiError(400, 'This order is Cash on Delivery and does not require online payment')
  }
  if (order.status === 'PAID') {
    throw new ApiError(409, 'This order has already been paid')
  }
  if (order.status !== 'PENDING') {
    throw new ApiError(409, `Order cannot be paid for (status: ${order.status})`)
  }

  await assertPricesUnchanged(order)

  const amount = Number(order.total)

  // Reuse an existing, still-valid Razorpay order instead of minting a new
  // one on every retry (e.g. the customer reopens the payment page).
  const existingPayment = await paymentModel.findByOrderId(order.id)
  if (
    existingPayment &&
    existingPayment.status === 'CREATED' &&
    Number(existingPayment.amount) === amount
  ) {
    return {
      razorpayOrderId: existingPayment.razorpay_order_id,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderNumber: order.order_number,
    }
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: toPaise(amount),
    currency: 'INR',
    receipt: order.order_number,
    notes: { orderId: String(order.id) },
  })

  await paymentModel.createPayment({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount,
    status: 'CREATED',
  })

  return {
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    orderNumber: order.order_number,
  }
}

const verifyPayment = async ({ orderId, user, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const order = await getOwnedOrder(orderId, user)

  // Idempotent: a duplicate verify call (e.g. a retried network request)
  // for an already-paid order should not fail or re-run side effects.
  if (order.status === 'PAID') {
    return { order, alreadyPaid: true }
  }

  const payment = await paymentModel.findByRazorpayOrderId(razorpayOrderId)
  if (!payment || payment.order_id !== order.id) {
    throw new ApiError(400, 'Payment record not found for this order')
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expectedSignature, 'hex')
  const actualBuffer = Buffer.from(String(razorpaySignature || ''), 'hex')

  const isValid =
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)

  if (!isValid) {
    await paymentModel.markFailed(razorpayOrderId)
    throw new ApiError(400, 'Payment verification failed: invalid signature')
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await paymentModel.markPaid({ razorpayOrderId, razorpayPaymentId }, client)
    const updatedOrder = await orderModel.updateStatus(order.id, 'PAID', client)
    await client.query('COMMIT')
    return { order: updatedOrder, alreadyPaid: false }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// Called by the frontend when Razorpay Checkout reports a failed attempt
// (declined card, etc.) so the payment record reflects reality instead of
// sitting at CREATED forever. The order itself stays PENDING so the
// customer can retry from the payment page.
const markPaymentFailed = async ({ orderId, user, razorpayOrderId }) => {
  const order = await getOwnedOrder(orderId, user)

  const payment = await paymentModel.findByRazorpayOrderId(razorpayOrderId)
  if (!payment || payment.order_id !== order.id) {
    throw new ApiError(400, 'Payment record not found for this order')
  }
  if (payment.status === 'PAID') {
    throw new ApiError(409, 'This payment has already succeeded')
  }

  return paymentModel.markFailed(razorpayOrderId)
}

module.exports = { createRazorpayOrder, verifyPayment, markPaymentFailed }
