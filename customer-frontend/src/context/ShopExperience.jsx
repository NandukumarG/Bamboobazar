import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from './CartContext'
import { getProduct } from '../services/product.service'
import { formatCurrency } from '../utils/currency'
import ShopDialog from '../components/ShopDialog'
import ProductImage from '../components/ProductImage'

const ShopContext = createContext(null)

function QuickView({ id, onClose, onAdd }) {
  const { items } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setError('')
    setProduct(null)
    getProduct(id).then(data => {
      if (active) data ? setProduct(data) : setError('This piece is currently unavailable.')
    }).catch(() => { if (active) setError('We could not load this piece. Please try again.') })
    return () => { active = false }
  }, [id, attempt])
  const available = product ? Math.max(0, product.stock - (items.find(item => item.productId === product.id)?.quantity || 0)) : 0
  const selectedQuantity = Math.min(quantity, available)
  return <ShopDialog label="Product quick view" onClose={onClose}>
    {error ? <div className="dialog-empty" role="alert"><span className="eyebrow">A little interruption</span><h2>Let's try again.</h2><p>{error}</p><button className="btn btn-primary" onClick={() => setAttempt(value => value + 1)}>Retry</button></div>
      : !product ? <div className="quick-view quick-view--loading" role="status" aria-label="Loading product"><div className="skeleton" /><div className="quick-view__copy"><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /><p>Getting a closer look...</p></div></div>
      : <div className="quick-view">
        <div className="quick-view__image"><ProductImage src={product.image_url} name={product.name} loading="eager" /></div>
        <div className="quick-view__copy">
          <span className="eyebrow">A closer look</span><h2>{product.name}</h2>
          <div className="quick-view__price"><strong>{formatCurrency(product.selling_price)}</strong>{Number(product.discount) > 0 && <del>{formatCurrency(product.original_price)}</del>}</div>
          <p className="quick-view__description">{product.description || 'A considered addition to your everyday. Explore the full details to find out more.'}</p>
          <p className="quick-view__stock">{product.stock > 0 ? available > 0 ? 'In stock and ready for your space' : 'You have the available quantity in your bag' : 'Currently out of stock'}</p>
          {available > 0 && <div className="quantity-control"><span>Quantity</span><div className="qty-stepper"><button aria-label="Decrease preview quantity" disabled={selectedQuantity <= 1} onClick={() => setQuantity(selectedQuantity - 1)}>-</button><output aria-label="Selected quantity">{selectedQuantity}</output><button aria-label="Increase preview quantity" disabled={selectedQuantity >= available} onClick={() => setQuantity(selectedQuantity + 1)}>+</button></div></div>}
          <button className="btn btn-primary quick-view__add" disabled={available === 0} onClick={() => onAdd(product, selectedQuantity)}>{available > 0 ? 'Add to bag' : product.stock > 0 ? 'Maximum in bag' : 'Out of stock'} <span aria-hidden="true">&#8599;</span></button>
          <Link to={`/products/${product.id}`} className="text-link" onClick={onClose}>View all details <span aria-hidden="true">&#8594;</span></Link>
        </div>
      </div>}
  </ShopDialog>
}

function Bag({ onClose }) {
  const { items, subtotal, updateQuantity, removeItem } = useCart()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  return <ShopDialog label="Your shopping bag" drawer onClose={onClose}>
    <div className="bag-heading"><span className="eyebrow">Good things, gathered</span><h2>Your bag <span>{count}</span></h2></div>
    {items.length === 0 ? <div className="bag-empty"><span aria-hidden="true">&#10035;</span><h3>A little room for nature.</h3><p>Your next favourite piece is waiting to be discovered.</p><Link to="/products" className="btn btn-primary" onClick={onClose}>Explore the collection &#8599;</Link></div>
      : <><div className="bag-items">{items.map(item => <article className="bag-item" key={item.productId}>
        <Link to={`/products/${item.productId}`} className="bag-item__image" onClick={onClose}><ProductImage src={item.imageUrl} name={item.name} /></Link>
        <div className="bag-item__info"><Link to={`/products/${item.productId}`} onClick={onClose}>{item.name}</Link><span>{formatCurrency(item.price)}</span>
          <div className="bag-item__controls"><div className="qty-stepper"><button aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button><output aria-label={`${item.name} quantity`}>{item.quantity}</output><button aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button></div><button className="bag-remove" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.productId)}>Remove</button></div>
        </div>
      </article>)}</div>
      <div className="bag-summary"><div aria-live="polite"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><p>Shipping is calculated at checkout.</p><Link to="/checkout" className="btn btn-primary" onClick={onClose}>Continue to checkout &#8599;</Link><Link to="/cart" className="text-link" onClick={onClose}>View full cart</Link></div></>}
  </ShopDialog>
}

export function ShopExperience({ children }) {
  const { addItem, items } = useCart()
  const location = useLocation()
  const [overlay, setOverlay] = useState(null)
  const close = useCallback(() => setOverlay(null), [])
  const openBag = useCallback(() => setOverlay({ type: 'bag' }), [])
  const quickView = useCallback(id => setOverlay({ type: 'product', id }), [])
  useEffect(close, [location.key, close])
  const addToBag = useCallback((product, quantity = 1) => {
    const available = product.stock - (items.find(item => item.productId === product.id)?.quantity || 0)
    if (available <= 0 || quantity < 1) return
    addItem(product, Math.min(quantity, available))
    openBag()
  }, [items, addItem, openBag])
  const value = useMemo(() => ({ openBag, quickView, addToBag }), [openBag, quickView, addToBag])
  return <ShopContext.Provider value={value}>{children}
    {overlay?.type === 'product' && <QuickView key={overlay.id} id={overlay.id} onClose={close} onAdd={addToBag} />}
    {overlay?.type === 'bag' && <Bag onClose={close} />}
  </ShopContext.Provider>
}

export const useShopExperience = () => useContext(ShopContext)
