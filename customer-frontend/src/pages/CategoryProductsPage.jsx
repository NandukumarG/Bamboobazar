import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as categoryService from '../services/category.service'
import * as productService from '../services/product.service'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

function CategoryProductsPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([categoryService.getCategory(slug), productService.getProducts({ category: slug })])
      .then(([categoryData, productData]) => {
        setCategory(categoryData)
        setProducts(productData)
      })
      .catch((err) => setError(err.response?.data?.message || 'Category not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Loader />
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="page">
      <h1>{category?.name}</h1>
      {category?.description && <p className="page-subtitle">{category.description}</p>}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} showAddToCart />
        ))}
        {products.length === 0 && <p>No products in this category yet.</p>}
      </div>
    </div>
  )
}

export default CategoryProductsPage
