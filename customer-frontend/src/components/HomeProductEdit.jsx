import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

export default function HomeProductEdit({ products, categories, loading, error }) {
  const [selected, setSelected] = useState('all')
  const shown = products.filter(product => selected === 'all' || product.category_slug === selected).slice(0, 4)
  const filters = categories.filter(category => products.some(product => product.category_slug === category.slug))
  return <section className="section home-edit" id="everyday-edit">
    <div className="section-heading section-heading--row"><div><span className="eyebrow">Objects with a little more soul</span><h2>The everyday edit.</h2><p>Find the pieces that feel like you.</p></div><Link to="/products" className="text-link">Shop all pieces &#8599;</Link></div>
    {!loading && !error && <div className="edit-filters" role="group" aria-label="Filter the everyday edit"><button aria-pressed={selected === 'all'} onClick={() => setSelected('all')}>All pieces</button>{filters.map(category => <button key={category.id} aria-pressed={selected === category.slug} onClick={() => setSelected(category.slug)}>{category.name}</button>)}</div>}
    {loading ? <div className="product-grid" role="status" aria-label="Loading the everyday edit">{[0,1,2,3].map(index => <div className="product-skeleton" key={index}><div className="skeleton" /><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /></div>)}</div> : error ? <div className="empty-panel" role="alert"><p>{error}</p><Link className="text-link" to="/products">Try the full collection &#8599;</Link></div> : <><p className="sr-only" role="status">Showing {shown.length} pieces</p><div className="product-grid" key={selected}>{shown.map(product => <ProductCard key={product.id} product={product} showAddToCart />)}</div>{!shown.length && <p className="empty-panel">New pieces are on their way. Check back soon.</p>}</>}
  </section>
}
