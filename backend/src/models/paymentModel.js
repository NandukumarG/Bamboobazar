const pool = require('../config/db')

const findByOrderId = async (orderId) => {
  const result = await pool.query(
    'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
    [orderId]
  )
  return result.rows[0]
}

module.exports = { findByOrderId }
