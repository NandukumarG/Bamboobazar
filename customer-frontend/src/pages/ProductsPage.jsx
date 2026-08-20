import { useEffect, useState } from 'react'
import * as productService from '../services/product.service'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    productService
      .getProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <h1>All products</h1>

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
