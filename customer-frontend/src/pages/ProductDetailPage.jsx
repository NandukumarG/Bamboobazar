import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as productService from '../services/product.service'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'
import Loader from '../components/Loader'

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setLoading(true)
    productService
      .getProduct(id)
      .then((data) => {
        setProduct(data)
        setQuantity(data.stock > 0 ? 1 : 0)
      })
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (error) return <div className="alert alert-error">{error}</div>
  if (!product) return null

  const inStock = product.stock > 0
  const hasDiscount = Number(product.discount) > 0

  const handleAddToCart = () => {
    addItem(product, quantity)
    setNotice('Added to cart.')
  }

  const handleBuyNow = () => {
    addItem(product, quantity)
    navigate('/checkout')
  }

  return (
    <div className="page product-detail">
      <div className="product-detail__image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="product-card__placeholder">No image</div>
        )}
      </div>

      <div className="product-detail__info">
        <h1>{product.name}</h1>
        <p className="product-detail__id">Product ID: {product.id}</p>

        <p className="product-detail__description">{product.description}</p>

        <div className="product-detail__pricing">
          <span className="product-detail__selling">{formatCurrency(product.selling_price)}</span>
          {hasDiscount && (
            <>
              <span className="product-detail__original">{formatCurrency(product.original_price)}</span>
              <span className="badge badge-success">{Number(product.discount)}% off</span>
            </>
          )}
        </div>

        <p className={`product-detail__stock${inStock ? '' : ' is-out'}`}>
          {inStock ? `In stock: ${product.stock}` : 'Out of stock'}
        </p>

        {inStock && (
          <label className="field product-detail__quantity">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))
              }
            />
          </label>
        )}

        {notice && <div className="alert alert-success">{notice}</div>}

        <div className="product-detail__actions">
          <button type="button" className="btn btn-ghost" disabled={!inStock} onClick={handleAddToCart}>
            Add to cart
          </button>
          <button type="button" className="btn btn-primary" disabled={!inStock} onClick={handleBuyNow}>
            Buy now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
