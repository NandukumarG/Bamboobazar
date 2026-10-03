import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as orderService from '../services/orderService'
import { formatCurrency } from '../utils/currency'

const STATUSES = ['PENDING', 'PAID', 'CANCELLED']

function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const loadOrder = () => {
    setLoading(true)
    orderService
      .getOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load order'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleStatusChange = async (event) => {
    setUpdating(true)
    try {
      await orderService.updateOrderStatus(id, event.target.value)
      loadOrder()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <p>Loading order…</p>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!order) return null

  return (
    <div>
      <h1>Order {order.order_number}</h1>

      <div className="detail-grid">
        <section className="card">
          <h2>Customer &amp; address</h2>
          <p>{order.customer_name}</p>
          <p>{order.phone}</p>
          <p>{order.email}</p>
          <p>
            {order.address}, {order.city}, {order.state} {order.pincode}
          </p>
        </section>

        <section className="card">
          <h2>Order status</h2>
          <select value={order.status} onChange={handleStatusChange} disabled={updating}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <h2>Payment</h2>
          <p>
            <span className={`badge badge-method-${order.payment_method.toLowerCase()}`}>
              {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Online'}
            </span>
          </p>
          {order.payment ? (
            <p>
              <span className={`badge badge-status-${order.payment.status.toLowerCase()}`}>
                {order.payment.status}
              </span>{' '}
              — {formatCurrency(order.payment.amount)}
            </p>
          ) : order.payment_method === 'COD' ? (
            <p>Collected in cash on delivery.</p>
          ) : (
            <p>No payment recorded yet.</p>
          )}
        </section>

      </div>

      <section className="card">
        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="order-summary">
          <div>
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="order-summary__total">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default OrderDetailPage
