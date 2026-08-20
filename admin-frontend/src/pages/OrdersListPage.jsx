import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as orderService from '../services/orderService'
import { formatCurrency } from '../utils/currency'

function OrdersListPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService
      .getOrders()
      .then(setOrders)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1>Orders</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading orders…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`badge badge-status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6}>No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OrdersListPage
