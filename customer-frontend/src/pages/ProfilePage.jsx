import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as orderService from '../services/order.service'
import Loader from '../components/Loader'
import { formatCurrency } from '../utils/currency'

const STATUS_BADGE = {
  PAID: 'badge-success',
  DELIVERED: 'badge-success',
}

function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    orderService
      .getOrders()
      .then(setOrders)
      .catch(() => setError('Failed to load your orders.'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const lastOrder = orders[0]

  return (
    <div className="page">
      <h1>My Account</h1>

      <div className="card">
        <h2>Account Details</h2>
        <p>
          <strong>{user?.name}</strong>
        </p>
        <p>{user?.email}</p>
        {user?.phone && <p>{user.phone}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Shipping Address</h2>
        {lastOrder ? (
          <>
            <p className="page-subtitle">From your most recent order — updated automatically every time you check out.</p>
            <p>{lastOrder.customer_name}</p>
            <p>{lastOrder.address}</p>
            <p>
              {lastOrder.city}, {lastOrder.state} {lastOrder.pincode}
            </p>
            <p>{lastOrder.phone}</p>
          </>
        ) : (
          <p className="page-subtitle">No address on file yet — it's saved automatically the first time you check out.</p>
        )}
      </div>

      <div className="card">
        <h2>Order History</h2>

        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && orders.length === 0 && <p>You haven't placed any orders yet.</p>}

        {!loading && !error && orders.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-muted'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
