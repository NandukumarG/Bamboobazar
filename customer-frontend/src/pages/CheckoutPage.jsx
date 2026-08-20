import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import * as orderService from '../services/order.service'
import { formatCurrency } from '../utils/currency'

const SHIPPING_FLAT_RATE = 0

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const total = subtotal + SHIPPING_FLAT_RATE

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setErrors([])

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)

    try {
      // Only productId + quantity go to the backend — it looks up current
      // price and stock in PostgreSQL and computes the total itself.
      const order = await orderService.createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      })

      clearCart()
      navigate('/payment', { state: { order } })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.')
      setErrors(err.response?.data?.errors || [])
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div className="page checkout">
      <h1>Checkout</h1>

      <div className="checkout__grid">
        <form className="form-card" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
              {errors.length > 0 && (
                <ul>
                  {errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input value={form.name} onChange={handleChange('name')} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={handleChange('email')} required />
            </label>
            <label className="field">
              <span>Phone</span>
              <input value={form.phone} onChange={handleChange('phone')} required />
            </label>
            <label className="field">
              <span>City</span>
              <input value={form.city} onChange={handleChange('city')} required />
            </label>
            <label className="field">
              <span>State</span>
              <input value={form.state} onChange={handleChange('state')} required />
            </label>
            <label className="field">
              <span>Pincode</span>
              <input value={form.pincode} onChange={handleChange('pincode')} required />
            </label>
          </div>

          <label className="field">
            <span>Address</span>
            <textarea rows={3} value={form.address} onChange={handleChange('address')} required />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </form>

        <aside className="card checkout__summary">
          <h2>Order summary</h2>
          <ul className="checkout__items">
            {items.map((item) => (
              <li key={item.productId}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="order-summary">
            <div>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>{formatCurrency(SHIPPING_FLAT_RATE)}</span>
            </div>
            <div className="order-summary__total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
