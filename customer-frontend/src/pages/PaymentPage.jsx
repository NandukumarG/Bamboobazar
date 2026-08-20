import { Link, useLocation } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'

function PaymentPage() {
  const location = useLocation()
  const order = location.state?.order || null

  if (!order) {
    return (
      <div className="page">
        <h1>Order placed</h1>
        <div className="alert alert-error">
          No order details found. Please check your account or contact support.
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Order placed</h1>

      <div className="card">
        <p>
          Thank you! Your order <strong>{order.order_number}</strong> has been received and is{' '}
          <strong>{order.status}</strong>.
        </p>
        <p>Total: {formatCurrency(order.total)}</p>
        <p className="page-subtitle">
          Online payment via Razorpay will be enabled in an upcoming update. Our team will reach out
          to confirm payment for this order.
        </p>
        <Link to="/products" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}

export default PaymentPage
