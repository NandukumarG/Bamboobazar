import { useEffect, useState } from 'react'
import * as categoryService from '../services/category.service'
import CategoryCard from '../components/CategoryCard'
import Loader from '../components/Loader'

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <h1>Categories</h1>

      {loading && <Loader />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
          {categories.length === 0 && <p>No categories available yet.</p>}
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
