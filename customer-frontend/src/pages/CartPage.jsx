import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'

// Display-only estimate; the backend computes the authoritative shipping and
// total from PostgreSQL when the order is actually placed.
const SHIPPING_FLAT_RATE = 0

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
      <h1>Your cart</h1>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId}>
                <td>{item.name}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
                    className="cart-qty-input"
                  />
                </td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      <div className="form-actions">
        <button type="button" className="btn btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  )
}

export default CartPage
