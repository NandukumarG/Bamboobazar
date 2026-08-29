import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'
import checkoutBg from '../assets/checkout.png'

// Display-only estimate; the backend computes the authoritative shipping and
// total from PostgreSQL when the order is actually placed.
const SHIPPING_FLAT_RATE = 0

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

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </svg>
)

function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  const total = subtotal + SHIPPING_FLAT_RATE

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/products" className="btn btn-primary">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="icon-heading">
        Your cart <LeafIcon />
      </h1>

      <div className="table-wrap">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId}>
                <td>
                  <div className="cart-product">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="cart-product__thumb" />
                    )}
                    <div className="cart-product__info">
                      <strong>{item.name}</strong>
                      <span className={`badge ${item.stock > 0 ? 'badge-success' : 'badge-muted'}`}>
                        {item.stock > 0 ? 'In stock' : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(item.productId)}
                  >
                    <TrashIcon /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cart-secure">
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
        <div className="cart-secure__summary">
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
              <span>{formatCurrency(SHIPPING_FLAT_RATE)}</span>
            </div>
            <div className="order-summary__total">
              <span className="order-summary__label">
                <TagIcon /> Total
              </span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cart-checkout-action">
        <button type="button" className="btn btn-dark pill-cta" onClick={() => navigate('/checkout')}>
          <span>Proceed to checkout</span>
          <span className="pill-cta__arrow">
            <ArrowIcon />
          </span>
        </button>
      </div>
    </div>
  )
}

export default CartPage
