import { useEffect, useState } from 'react'
import * as categoryService from '../services/category.service'
import CategoryTile from '../components/CategoryTile'
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
      <div className="catalog-heading"><span className="eyebrow">A place for every piece</span><h1>Find your kind of natural.</h1><p>Explore the collection, one beautiful corner of your home at a time.</p></div>

      {loading && <Loader />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="collection-gallery">
          {categories.map((category, index) => (
            <div key={category.id} className="collection-gallery__item"><CategoryTile category={category} index={index} imageUrl={category.image_url} /><p>{category.description}</p></div>
          ))}
          {categories.length === 0 && <p>No categories available yet.</p>}
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
