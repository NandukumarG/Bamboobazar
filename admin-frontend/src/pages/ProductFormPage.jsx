import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as productService from '../services/productService'
import * as categoryService from '../services/categoryService'

const emptyForm = {
  categoryId: '',
  name: '',
  slug: '',
  description: '',
  productCode: '',
  originalPrice: '',
  discount: '0',
  stock: '0',
  imageUrl: '',
}

function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    productService
      .getProduct(id)
      .then((product) =>
        setForm({
          categoryId: product.category_id ?? '',
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          productCode: product.product_code,
          originalPrice: product.original_price,
          discount: product.discount,
          stock: product.stock,
          imageUrl: product.image_url || '',
        })
      )
      .catch((err) => setError(err.response?.data?.message || 'Failed to load product'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleImageFileChange = async (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return

    setUploadError('')
    setUploading(true)
    try {
      const url = await productService.uploadProductImage(file)
      setForm((prev) => ({ ...prev, imageUrl: url }))
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setErrors([])
    setSubmitting(true)

    const payload = {
      categoryId: Number(form.categoryId),
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      productCode: form.productCode,
      originalPrice: Number(form.originalPrice),
      discount: Number(form.discount),
      stock: Number(form.stock),
      imageUrl: form.imageUrl,
    }

    try {
      if (isEdit) {
        await productService.updateProduct(id, payload)
      } else {
        await productService.createProduct(payload)
      }
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
      setErrors(err.response?.data?.errors || [])
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Loading…</p>

  return (
    <div>
      <h1>{isEdit ? 'Edit product' : 'Add product'}</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error">
            {error}
            {errors.length > 0 && (
              <ul>
                {errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="form-grid">
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={handleChange('name')} required />
          </label>

          <label className="field">
            <span>Slug (optional)</span>
            <input
              value={form.slug}
              onChange={handleChange('slug')}
              placeholder="auto-generated from name"
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select value={form.categoryId} onChange={handleChange('categoryId')} required>
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {!category.is_active ? ' (inactive)' : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Product code</span>
            <input value={form.productCode} onChange={handleChange('productCode')} required />
          </label>

          <label className="field">
            <span>Original price (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.originalPrice}
              onChange={handleChange('originalPrice')}
              required
            />
          </label>

          <label className="field">
            <span>Discount (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.discount}
              onChange={handleChange('discount')}
            />
          </label>

          <label className="field">
            <span>Stock</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange('stock')}
              required
            />
          </label>

          <label className="field">
            <span>Image URL</span>
            <input
              value={form.imageUrl}
              onChange={handleChange('imageUrl')}
              placeholder="https://res.cloudinary.com/…"
            />
          </label>

          <label className="field">
            <span>Upload image</span>
            <input type="file" accept="image/*" onChange={handleImageFileChange} disabled={uploading} />
            {uploading && <small>Uploading…</small>}
            {uploadError && <small className="alert-error">{uploadError}</small>}
            {form.imageUrl && !uploading && (
              <img
                src={form.imageUrl}
                alt="Product preview"
                style={{ maxWidth: '160px', marginTop: '8px', borderRadius: '4px' }}
              />
            )}
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <textarea rows={4} value={form.description} onChange={handleChange('description')} />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductFormPage
