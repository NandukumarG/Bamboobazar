import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as productService from '../services/product.service'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

export default function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') || ''
  const [query, setQuery] = useState(search)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('featured')
  const [inStock, setInStock] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => setQuery(search), [search])
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    productService.getProducts(search ? { search } : {})
      .then(data => { if (active) setProducts(data) })
      .catch(() => { if (active) setError('We could not load the collection. Please try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, attempt])
  const visible = useMemo(() => {
    const result = products.filter(product => !inStock || product.stock > 0)
    if (sort === 'price-low') result.sort((a, b) => Number(a.selling_price) - Number(b.selling_price))
    if (sort === 'price-high') result.sort((a, b) => Number(b.selling_price) - Number(a.selling_price))
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [products, inStock, sort])
  return (
    <div className="page catalog-page">
      <div className="catalog-heading"><span className="eyebrow">The bamboo collection</span><h1>{search ? `Results for "${search}"` : 'Naturally beautiful. Everyday useful.'}</h1><p>Considered pieces for a home that feels like you.</p></div>
      <div className="catalog-toolbar">
        <form className="catalog-search" role="search" onSubmit={event => { event.preventDefault(); setParams(query.trim() ? { search: query.trim() } : {}) }}><input type="search" aria-label="Search the collection" placeholder="Find your next favourite..." value={query} onChange={event => setQuery(event.target.value)} /><button className="btn btn-primary" type="submit">Search</button></form>
        <label className="catalog-stock"><input type="checkbox" checked={inStock} onChange={event => setInStock(event.target.checked)} /> In stock only</label>
        <label className="catalog-sort"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A-Z</option></select></label>
      </div>
      {loading ? <Loader label="Finding beautiful things..." /> : error ? <div className="empty-panel" role="alert"><h2>Let&apos;s try that again.</h2><p>{error}</p><button className="btn btn-primary" onClick={() => setAttempt(value => value + 1)}>Retry</button></div> : <><p className="catalog-count" role="status">{visible.length} {visible.length === 1 ? 'piece' : 'pieces'} to explore {search && <Link to="/products">Clear search</Link>}</p>{visible.length ? <div className="product-grid">{visible.map(product => <ProductCard key={product.id} product={product} showAddToCart />)}</div> : <div className="empty-panel"><h2>A fresh start?</h2><p>Try another search or turn off the stock filter to explore more pieces.</p><button className="btn btn-primary" onClick={() => { setParams({}); setInStock(false); setSort('featured') }}>Reset filters</button></div>}</>}
    </div>
  )
}
