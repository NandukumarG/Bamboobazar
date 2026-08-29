import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import * as orderService from '../services/order.service'
import { getShippingQuote } from '../services/shipping.service'
import { formatCurrency } from '../utils/currency'
import checkoutBg from '../assets/checkout.png'

const PINCODE_REGEX = /^\d{6}$/

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M5 19c9-1 13-6 14-14-8 1-13 5-14 14Z" />
    <path d="M5 19c2-4 5-7 9-9" />
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5 5 6v5.5c0 4.6 3 8 7 9 4-1 7-4.4 7-9V6l-7-2.5Z" />
    <path d="m8.7 12.2 2.2 2.2 4.4-4.5" />
  </svg>
)

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
)

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h10v9H3z" />
    <path d="M13 11h4l3 3v2h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </svg>
)

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4h6a1 1 0 0 1 1 1v6l-8.5 8.5a1 1 0 0 1-1.4 0L3.5 15a1 1 0 0 1 0-1.4L12 5" />
    <circle cx="15" cy="8" r="1.2" />
  </svg>
)

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

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
  const [paymentMethod, setPaymentMethod] = useState('ONLINE')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const [shipping, setShipping] = useState(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState('')

  useEffect(() => {
    if (!PINCODE_REGEX.test(form.pincode)) {
      setShipping(null)
      setShippingError('')
      return
    }

    let cancelled = false
    setShippingLoading(true)
    setShippingError('')

    const timer = setTimeout(async () => {
      try {
        const fee = await getShippingQuote({ pincode: form.pincode, paymentMethod })
        if (!cancelled) setShipping(fee)
      } catch (err) {
        if (!cancelled) {
          setShipping(null)
          setShippingError(err.response?.data?.message || 'Delivery is not available for this pincode.')
        }
      } finally {
        if (!cancelled) setShippingLoading(false)
      }
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [form.pincode, paymentMethod])

  const total = subtotal + (shipping || 0)

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
        paymentMethod,
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      })

      // Stock is reserved as soon as the order is created either way, but the
      // cart itself should only empty once the purchase is actually final —
      // COD is confirmed immediately, ONLINE isn't until PaymentPage
      // reports a successful Razorpay verification.
      if (paymentMethod === 'COD') {
        clearCart()
      }
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
      <h1 className="icon-heading">
        Checkout <LeafIcon />
      </h1>

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

          <fieldset className="payment-method">
            <legend>Payment Method</legend>
            <label className="payment-method__option">
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === 'ONLINE'}
                onChange={() => setPaymentMethod('ONLINE')}
              />
              <span>
                <strong>Pay Online</strong>
                <small>Cards, UPI, netbanking via Razorpay</small>
              </span>
            </label>
            <label className="payment-method__option">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay in cash when your order arrives</small>
              </span>
            </label>
          </fieldset>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-dark pill-cta"
              disabled={submitting || shippingLoading || !shipping}
            >
              <span>{submitting ? 'Placing order…' : 'Place order'}</span>
              <span className="pill-cta__arrow">
                <ArrowIcon />
              </span>
            </button>
          </div>
        </form>

        <aside className="checkout__summary">
          <div className="card">
            <h2>Order summary</h2>
            <ul className="checkout__items">
              {items.map((item) => (
                <li key={item.productId}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="checkout__item-thumb" />
                  )}
                  <span className="checkout__item-info">
                    <span>{item.name}</span>
                    <small>Qty {item.quantity}</small>
                  </span>
                  <span className="checkout__item-price">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="order-summary">
              <div>
                <span className="order-summary__label">
                  <BagIcon /> Subtotal
                </span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div>
                <span className="order-summary__label">
                  <TruckIcon /> Shipping
                </span>
                <span>
                  {shippingLoading
                    ? 'Calculating…'
                    : shippingError
                      ? '—'
                      : shipping !== null
                        ? formatCurrency(shipping)
                        : 'Enter pincode'}
                </span>
              </div>
              {shippingError && <p className="field-error">{shippingError}</p>}
              <div className="order-summary__total">
                <span className="order-summary__label">
                  <TagIcon /> Total
                </span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="trust-panel">
            <div className="trust-panel__text">
              <span className="trust-panel__icon">
                <ShieldIcon />
              </span>
              <div>
                <strong>Secure Checkout</strong>
                <small>Your payment information is always safe with us.</small>
              </div>
            </div>
            <div className="trust-panel__image">
              <img src={checkoutBg} alt="" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
