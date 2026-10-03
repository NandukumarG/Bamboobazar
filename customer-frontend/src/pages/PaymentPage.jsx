import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as paymentService from '../services/payment.service'
import { loadRazorpayScript } from '../utils/loadRazorpayScript'
import { formatCurrency } from '../utils/currency'
import { useCart } from '../context/CartContext'

function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [order] = useState(location.state?.order || null)
  const [status, setStatus] = useState(order?.status === 'PAID' ? 'success' : 'idle')
  const [error, setError] = useState('')
  const [paidOrder, setPaidOrder] = useState(order?.status === 'PAID' ? order : null)

  const renderCelebrationModal = (confirmedOrder, paymentLabel) => {
    const paperPieces = Array.from({ length: 22 }, (_, index) => ({
      id: index,
      left: `${(index * 13) % 100}%`,
      delay: `${(index % 7) * 0.08}s`,
      duration: `${1.2 + (index % 6) * 0.18}s`,
      color: ['#f4d58d', '#d8e7c0', '#f4b7a6', '#d1e5f2', '#c9b7f7'][index % 5],
      rotate: `${(index % 10) * 28 - 90}deg`,
      scale: 0.7 + (index % 5) * 0.16,
    }))

    return (
      <>
        <style>{`
          @keyframes paper-fall {
            0% {
              opacity: 0;
              transform: translate3d(0, -28px, 0) rotate(0deg) scale(0.8);
            }
            12% { opacity: 1; }
            100% {
              opacity: 0;
              transform: translate3d(12px, 200px, 0) rotate(220deg) scale(1);
            }
          }

          @keyframes modal-pop {
            0% { opacity: 0; transform: scale(0.82) translateY(14px); }
            65% { opacity: 1; transform: scale(1.02) translateY(-4px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }

          .confirmation-overlay {
            position: fixed;
            inset: 0;
            background: rgba(12, 27, 20, 0.5);
            display: grid;
            place-items: center;
            padding: 1rem;
            z-index: 1000;
          }

          .confirmation-card {
            max-width: 480px;
            width: 100%;
            text-align: center;
            padding: 2rem 1.5rem;
            border-radius: 20px;
            background: #fffaf4;
            box-shadow: 0 30px 90px rgba(17, 29, 22, 0.22);
            position: relative;
            overflow: hidden;
            animation: modal-pop 0.45s ease-out;
          }

          .paper-piece {
            position: absolute;
            top: -20px;
            width: 14px;
            height: 20px;
            border-radius: 4px;
            opacity: 0;
            animation: paper-fall var(--duration) ease-in forwards;
            animation-delay: var(--delay);
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
          }
        `}</style>

        <div className="confirmation-overlay">
          <div className="confirmation-card card">
            {paperPieces.map((piece) => (
              <span
                key={piece.id}
                className="paper-piece"
                style={{
                  left: piece.left,
                  background: piece.color,
                  '--delay': piece.delay,
                  '--duration': piece.duration,
                  transform: `rotate(${piece.rotate}) scale(${piece.scale})`,
                }}
              />
            ))}

            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 1rem',
                background: '#e6f3df',
                color: '#244c2d',
                fontSize: '2.5rem',
                fontWeight: '700',
                position: 'relative',
                zIndex: 1,
              }}
            >
              ✓
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6d7b5d', position: 'relative', zIndex: 1 }}>
              Order confirmed
            </p>
            <h2 style={{ margin: '0.5rem 0 1rem', fontSize: '2rem', position: 'relative', zIndex: 1 }}>Thank you for your purchase!</h2>

            <div style={{ textAlign: 'left', display: 'grid', gap: '0.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <p><strong>Order Id:</strong> {confirmedOrder.order_number || confirmedOrder.orderNumber}</p>
              <p><strong>Payment Mode:</strong> {paymentLabel}</p>
              <p><strong>Total:</strong> {formatCurrency(confirmedOrder.total)}</p>
              <p><strong>Email:</strong> {confirmedOrder.email}</p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/products')}
              style={{ position: 'relative', zIndex: 1 }}
            >
              Continue shopping
            </button>
          </div>
        </div>
      </>
    )
  }

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
      <>
        {renderCelebrationModal(paid, paid.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment')}
        <div className="page" style={{ filter: 'blur(1px)' }}>
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
      </>
    )
  }

  if (order.payment_method === 'COD') {
    return (
      <>
        {renderCelebrationModal(order, 'Cash on Delivery')}
        <div className="page" style={{ filter: 'blur(1px)' }}>
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
      </>
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
