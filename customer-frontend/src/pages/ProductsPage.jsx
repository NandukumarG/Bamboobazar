import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as productService from '../services/product.service'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

function ProductsPage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    productService
      .getProducts(search ? { search } : {})
      .then(setProducts)
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="page">
      <h1>{search ? `Results for "${search}"` : 'All products'}</h1>

      {loading && <Loader />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && <p>No products available yet.</p>}
        </div>
      )}
    </div>
  )
}

export default ProductsPage
