const pool = require('../config/db')

const REVENUE_STATUSES = ['PAID']

const getStats = async () => {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM products) AS total_products,
       (SELECT COUNT(*) FROM products WHERE is_listed = true) AS active_products,
       (SELECT COUNT(*) FROM orders) AS total_orders,
       (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = ANY($1)) AS total_revenue`,
    [REVENUE_STATUSES]
  )

  const row = result.rows[0]

  return {
    totalProducts: Number(row.total_products),
    activeProducts: Number(row.active_products),
    totalOrders: Number(row.total_orders),
    totalRevenue: Number(row.total_revenue),
  }
}

module.exports = { getStats }
