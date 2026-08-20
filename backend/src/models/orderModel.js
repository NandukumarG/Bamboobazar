const pool = require('../config/db')

const createOrder = async (order, client = pool) => {
  const result = await client.query(
    `INSERT INTO orders
      (user_id, order_number, subtotal, shipping, total, status,
       customer_name, phone, email, address, city, state, pincode)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      order.userId,
      order.orderNumber,
      order.subtotal,
      order.shipping,
      order.total,
      order.status,
      order.customerName,
      order.phone,
      order.email,
      order.address,
      order.city,
      order.state,
      order.pincode,
    ]
  )
  return result.rows[0]
}

const findOrdersByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows
}

const findAllOrders = async () => {
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC')
  return result.rows
}

const findOrderById = async (id) => {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
  return result.rows[0]
}

const updateStatus = async (id, status) => {
  const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [
    status,
    id,
  ])
  return result.rows[0]
}

module.exports = {
  createOrder,
  findOrdersByUser,
  findAllOrders,
  findOrderById,
  updateStatus,
}
