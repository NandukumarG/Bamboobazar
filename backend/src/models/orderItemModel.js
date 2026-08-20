const pool = require('../config/db')

const createOrderItem = async (item, client = pool) => {
  const result = await client.query(
    `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [item.orderId, item.productId, item.productName, item.quantity, item.price]
  )
  return result.rows[0]
}

const findItemsByOrderId = async (orderId) => {
  const result = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId])
  return result.rows
}

module.exports = { createOrderItem, findItemsByOrderId }
