import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as productService from '../services/productService'
import { formatCurrency } from '../utils/currency'

function ProductsListPage() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProducts = () => {
    setLoading(true)
    productService
      .getProducts()
      .then(setProducts)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const toggleStatus = async (product) => {
    await productService.updateProductStatus(product.id, !product.is_listed)
    loadProducts()
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    await productService.deleteProduct(product.id)
    loadProducts()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <Link to="/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading products…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category_name || '—'}</td>
                  <td>{formatCurrency(product.selling_price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`badge ${product.is_listed ? 'badge-success' : 'badge-muted'}`}>
                      {product.is_listed ? 'Listed' : 'Unlisted'}
                    </span>
                  </td>
                  <td className="table-actions">
                    <Link to={`/products/${product.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleStatus(product)}
                    >
                      {product.is_listed ? 'Unlist' : 'List'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6}>No products yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ProductsListPage
