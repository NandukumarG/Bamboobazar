import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useShopExperience } from '../context/ShopExperience'
import { formatCurrency } from '../utils/currency'
import { useTilt } from '../hooks/useTilt'
import ProductImage from './ProductImage'

export default function ProductCard({ product, showAddToCart = false }) {
  const { items } = useCart()
  const { quickView, addToBag } = useShopExperience()
  const tilt = useTilt()
  const atLimit = (items.find(item => item.productId === product.id)?.quantity || 0) >= product.stock
  return <article className="product-card tilt" ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave}>
    <div className="product-card__image">
      <Link to={`/products/${product.id}`} className="product-card__image-link"><ProductImage src={product.image_url} name={product.name} /></Link>
      {Number(product.discount) > 0 && <span className="product-card__badge">{Number(product.discount)}% off</span>}
      <button className="product-quick-view" onClick={() => quickView(product.id)} aria-label={`Quick view ${product.name}`}>Quick view <span aria-hidden="true">&#8599;</span></button>
    </div>
    <div className="product-card__body"><span className="product-card__category">{product.category_name || 'The bamboo collection'}</span><Link to={`/products/${product.id}`} className="product-card__link"><h3>{product.name}</h3></Link>
      <div className="product-card__price"><span className="product-card__selling">{formatCurrency(product.selling_price)}</span>{Number(product.discount) > 0 && <del className="product-card__original">{formatCurrency(product.original_price)}</del>}</div>
      {product.stock <= 0 && <span className="badge badge-muted">Out of stock</span>}
    </div>
    {showAddToCart && <button className="btn product-card__add" disabled={atLimit} onClick={() => addToBag(product)}>{product.stock <= 0 ? 'Out of stock' : atLimit ? 'Maximum in bag' : 'Add to bag +'}</button>}
  </article>
}
