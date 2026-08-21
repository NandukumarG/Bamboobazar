const pool = require('../config/db')

const findByOrderId = async (orderId) => {
  const result = await pool.query(
    'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
    [orderId]
  )
  return result.rows[0]
}

const findByRazorpayOrderId = async (razorpayOrderId, client = pool) => {
  const result = await client.query('SELECT * FROM payments WHERE razorpay_order_id = $1', [
    razorpayOrderId,
  ])
  return result.rows[0]
}

const createPayment = async ({ orderId, razorpayOrderId, amount, status = 'CREATED' }, client = pool) => {
  const result = await client.query(
    `INSERT INTO payments (order_id, razorpay_order_id, amount, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [orderId, razorpayOrderId, amount, status]
  )
  return result.rows[0]
}

const markPaid = async ({ razorpayOrderId, razorpayPaymentId }, client = pool) => {
  const result = await client.query(
    `UPDATE payments SET status = 'PAID', razorpay_payment_id = $1
     WHERE razorpay_order_id = $2
     RETURNING *`,
    [razorpayPaymentId, razorpayOrderId]
  )
  return result.rows[0]
}

const markFailed = async (razorpayOrderId, client = pool) => {
  const result = await client.query(
    `UPDATE payments SET status = 'FAILED' WHERE razorpay_order_id = $1 RETURNING *`,
    [razorpayOrderId]
  )
  return result.rows[0]
}

module.exports = {
  findByOrderId,
  findByRazorpayOrderId,
  createPayment,
  markPaid,
  markFailed,
}
