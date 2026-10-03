import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as productService from '../services/product.service'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'
import Loader from '../components/Loader'
import { useShopExperience } from '../context/ShopExperience'
import ShopDialog from '../components/ShopDialog'

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, items } = useCart()
  const { addToBag } = useShopExperience()
  const [zoom, setZoom] = useState(false)

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    productService
      .getProduct(id)
      .then((data) => {
        if (!active) return
        setProduct(data)
        setQuantity(data.stock > 0 ? 1 : 0)
      })
      .catch(() => { if (active) setError('Product not found.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <Loader />
  if (error) return <div className="alert alert-error">{error}</div>
  if (!product) return null

  const inStock = product.stock > 0
  const available = Math.max(0, product.stock - (items.find(item => item.productId === product.id)?.quantity || 0))
  const selectedQuantity = Math.min(quantity, available)
  const hasDiscount = Number(product.discount) > 0

  const handleAddToCart = () => {
    if (available > 0) addToBag(product, selectedQuantity)
  }

  const handleBuyNow = () => {
    if (available <= 0) return
    addItem(product, selectedQuantity)
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
        {product.image_url && <button className="product-image-zoom" onClick={() => setZoom(true)}>Take a closer look &#8599;</button>}
      </div>
      {zoom && <ShopDialog label={`Image of ${product.name}`} onClose={() => setZoom(false)}><img className="product-zoom-image" src={product.image_url} alt={product.name} /></ShopDialog>}

      <div className="product-detail__info">
        <div className="product-detail__breadcrumbs"><Link to="/products">Collection</Link> / {product.name}</div>
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

        {available > 0 && (
          <label className="field product-detail__quantity">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              max={available}
              value={selectedQuantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, available)))
              }
            />
          </label>
        )}

        {inStock && available === 0 && <p className="alert alert-success">All available pieces are already in your bag.</p>}

        <div className="product-detail__actions">
          <button type="button" className="btn btn-ghost" disabled={available === 0} onClick={handleAddToCart}>
            Add to cart
          </button>
          <button type="button" className="btn btn-primary" disabled={available === 0} onClick={handleBuyNow}>
            Buy now
          </button>
        </div>
        <div className="product-facts">
          <details><summary>About this piece</summary><p>{product.description || 'Explore our collection of bamboo pieces for everyday living.'}</p></details>
          <details><summary>Payment &amp; checkout</summary><p>Choose online payment or cash on delivery when placing your order, and keep track of your order status in your profile.</p></details>
          <details><summary>Your order, in one place</summary><p>Sign in to view your order history and status in your profile after checkout.</p></details>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
