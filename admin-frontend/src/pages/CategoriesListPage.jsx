import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as categoryService from '../services/categoryService'

function CategoriesListPage() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadCategories = () => {
    setLoading(true)
    categoryService
      .getCategories()
      .then(setCategories)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load categories'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const toggleStatus = async (category) => {
    await categoryService.updateCategoryStatus(category.id, !category.is_active)
    loadCategories()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <Link to="/categories/new" className="btn btn-primary">
          Add category
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading categories…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>
                    <span className={`badge ${category.is_active ? 'badge-success' : 'badge-muted'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-actions">
                    <Link to={`/categories/${category.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleStatus(category)}
                    >
                      {category.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4}>No categories yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CategoriesListPage
