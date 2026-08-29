import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as paymentService from '../services/payment.service'
import { loadRazorpayScript } from '../utils/loadRazorpayScript'
import { formatCurrency } from '../utils/currency'
import { useCart } from '../context/CartContext'

function PaymentPage() {
  const location = useLocation()
  const { clearCart } = useCart()
  const [order] = useState(location.state?.order || null)
  const [status, setStatus] = useState(order?.status === 'PAID' ? 'success' : 'idle')
  const [error, setError] = useState('')
  const [paidOrder, setPaidOrder] = useState(order?.status === 'PAID' ? order : null)

  if (!order) {
    return (
      <div className="page">
        <h1>Payment</h1>
        <div className="alert alert-error">
          No order details found. Please check your account or contact support.
        </div>
        <Link to="/products" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    )
  }

  const handlePayNow = async () => {
    setError('')
    setStatus('processing')

    try {
      await loadRazorpayScript()

      const { razorpayOrderId, amount, currency, keyId, orderNumber } =
        await paymentService.createRazorpayOrder(order.id)

      const rzp = new window.Razorpay({
        key: keyId,
        amount: Math.round(amount * 100),
        currency,
        name: 'Bamboo Store',
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: order.customer_name,
          email: order.email,
          contact: order.phone,
        },
        theme: { color: '#6B7A3D' },
        handler: async (response) => {
          try {
            const result = await paymentService.verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            setPaidOrder(result.order)
            setStatus('success')
            clearCart()
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.')
            setStatus('failed')
          }
        },
        modal: {
          ondismiss: () => {
            setStatus((current) => (current === 'processing' ? 'cancelled' : current))
          },
        },
      })

      rzp.on('payment.failed', async (response) => {
        try {
          await paymentService.markPaymentFailed({
            orderId: order.id,
            razorpayOrderId: response.error?.metadata?.order_id || razorpayOrderId,
          })
        } catch {
          // Best-effort — worst case the payment record just stays CREATED.
        } finally {
          setError(response.error?.description || 'Your payment could not be completed.')
          setStatus('failed')
        }
      })

      rzp.open()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment. Please try again.')
      setStatus('failed')
    }
  }

  if (status === 'success') {
    const paid = paidOrder || order
    return (
      <div className="page">
        <h1>Payment Successful</h1>
        <div className="card">
          <div className="alert alert-success">Order Confirmed</div>
          <p>
            Order Number: <strong>{paid.order_number || paid.orderNumber}</strong>
          </p>
          <p>
            Amount: <strong>{formatCurrency(paid.total)}</strong>
          </p>
          <Link to="/products" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  if (order.payment_method === 'COD') {
    return (
      <div className="page">
        <h1>Order Confirmed</h1>
        <div className="card">
          <div className="alert alert-success">Cash on Delivery</div>
          <p>
            Order Number: <strong>{order.order_number}</strong>
          </p>
          <p>
            Amount to pay on delivery: <strong>{formatCurrency(order.total)}</strong>
          </p>
          <p className="page-subtitle">
            Please keep the exact amount ready — payment is collected in cash when your order
            arrives.
          </p>
          <Link to="/products" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Payment</h1>

      <div className="card">
        {(status === 'failed' || status === 'cancelled') && (
          <div className="alert alert-error">
            {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
            {error && <p style={{ margin: '0.4rem 0 0' }}>{error}</p>}
          </div>
        )}

        <p>
          Order Number: <strong>{order.order_number}</strong>
        </p>
        <p>
          Amount to pay: <strong>{formatCurrency(order.total)}</strong>
        </p>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={status === 'processing'}
            onClick={handlePayNow}
          >
            {status === 'processing'
              ? 'Starting payment…'
              : status === 'failed' || status === 'cancelled'
                ? 'Try Again'
                : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
