import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as orderService from '../services/order.service'
import * as authService from '../services/auth.service'
import Loader from '../components/Loader'
import { formatCurrency } from '../utils/currency'

const STATUS_BADGE = {
  PAID: 'badge-success',
  DELIVERED: 'badge-success',
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

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

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return

    setUploadError('')
    setUploading(true)
    try {
      const updated = await authService.uploadAvatar(file)
      updateUser(updated)
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const lastOrder = orders[0]
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const deliveredCount = orders.filter((order) => order.status === 'DELIVERED').length
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : null

  return (
    <div className="page profile-page">
      <div className="profile-hero">
        <div className="profile-hero__cover" aria-hidden="true">
          <svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 90C60 60 120 100 180 75S300 40 400 70V120H0Z" fill="rgba(247,243,232,0.14)" />
            <path d="M0 105C70 85 140 115 210 95S320 65 400 95V120H0Z" fill="rgba(247,243,232,0.1)" />
          </svg>
        </div>

        <div className="profile-hero__body">
          <div className="profile-avatar">
            <div className="profile-avatar__circle">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} />
              ) : (
                <span className="profile-avatar__initials">{getInitials(user?.name)}</span>
              )}
              {uploading && (
                <span className="profile-avatar__uploading" aria-label="Uploading photo">
                  <span className="profile-avatar__spinner" />
                </span>
              )}
            </div>
            <button
              type="button"
              className="profile-avatar__edit"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              disabled={uploading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
                <circle cx="12" cy="13" r="3.3" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>

          <div className="profile-hero__info">
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            {memberSince && <span className="profile-hero__since">Member since {memberSince}</span>}
          </div>

          <button type="button" className="btn btn-ghost profile-hero__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {uploadError && <div className="alert alert-error profile-hero__error">{uploadError}</div>}
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat__value">{orders.length}</span>
          <span className="profile-stat__label">Orders placed</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__value">{formatCurrency(totalSpent)}</span>
          <span className="profile-stat__label">Total spent</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__value">{deliveredCount}</span>
          <span className="profile-stat__label">Delivered</span>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card">
          <h2>Account Details</h2>
          <dl className="profile-detail-list">
            <div>
              <dt>Full name</dt>
              <dd>{user?.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
            </div>
            {user?.phone && (
              <div>
                <dt>Phone</dt>
                <dd>{user.phone}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="card">
          <h2>Address on file</h2>
          {lastOrder ? (
            <>
              <p className="page-subtitle">
                From your most recent order — updated automatically every time you check out.
              </p>
              <p>{lastOrder.customer_name}</p>
              <p>{lastOrder.address}</p>
              <p>
                {lastOrder.city}, {lastOrder.state} {lastOrder.pincode}
              </p>
              <p>{lastOrder.phone}</p>
            </>
          ) : (
            <p className="page-subtitle">No address on file yet — it&apos;s saved automatically the first time you check out.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Order History</h2>

        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && orders.length === 0 && <p>You haven&apos;t placed any orders yet.</p>}

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
