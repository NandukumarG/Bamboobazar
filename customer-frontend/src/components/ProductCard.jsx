import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'
import { useTilt } from '../hooks/useTilt'

// showAddToCart opts a grid into a real "add to cart" action (used on the
// homepage's Best Sellers section); other listings keep the plain click-through card.
function ProductCard({ product, showAddToCart = false }) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const cartQuantity = items.find(item => item.productId === product.id)?.quantity || 0
  const atLimit = cartQuantity >= product.stock
  const tilt = useTilt()
  const hasDiscount = Number(product.discount) > 0
  const inStock = product.stock > 0

  const handleAddToCart = (event) => {
    event.preventDefault()
    if (!inStock || atLimit) return
    addItem(product, 1)
    setAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div
      className="product-card tilt"
      ref={tilt.ref}
      style={tilt.style}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
    >
      <Link to={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__image">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          )}
          <div className="product-card__placeholder">{product.name}</div>
          {hasDiscount && <span className="product-card__badge">{Number(product.discount)}% off</span>}
        </div>
        <div className="product-card__body">
          <h3>{product.name}</h3>
          <p className="product-card__id">ID: {product.product_code}</p>
          <div className="product-card__price">
            <span className="product-card__selling">{formatCurrency(product.selling_price)}</span>
            {hasDiscount && (
              <span className="product-card__original">{formatCurrency(product.original_price)}</span>
            )}
          </div>
          {!inStock && <span className="badge badge-muted">Out of stock</span>}
        </div>
      </Link>

      {showAddToCart && (
        <button
          type="button"
          className="btn btn-dark product-card__add"
          aria-live="polite"
          disabled={!inStock || atLimit}
          onClick={handleAddToCart}
        >
          {!inStock ? 'Out of stock' : added ? 'Added to cart' : atLimit ? 'Maximum in cart' : 'Add to cart +'}
        </button>
      )}
    </div>
  )
}

export default ProductCard
