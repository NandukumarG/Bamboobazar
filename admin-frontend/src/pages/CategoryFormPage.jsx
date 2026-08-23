import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as categoryService from '../services/categoryService'

const emptyForm = { name: '', slug: '', description: '', imageUrl: '' }

function CategoryFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    categoryService
      .getCategory(id)
      .then((category) =>
        setForm({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          imageUrl: category.image_url || '',
        })
      )
      .catch((err) => setError(err.response?.data?.message || 'Failed to load category'))
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
      const url = await categoryService.uploadCategoryImage(file)
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
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      imageUrl: form.imageUrl,
    }

    try {
      if (isEdit) {
        await categoryService.updateCategory(id, payload)
      } else {
        await categoryService.createCategory(payload)
      }
      navigate('/categories')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category')
      setErrors(err.response?.data?.errors || [])
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Loading…</p>

  return (
    <div>
      <h1>{isEdit ? 'Edit category' : 'Add category'}</h1>

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

        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={handleChange('name')} required />
        </label>

        <label className="field">
          <span>Slug (optional)</span>
          <input value={form.slug} onChange={handleChange('slug')} placeholder="auto-generated from name" />
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
              alt="Category preview"
              style={{ maxWidth: '160px', marginTop: '8px', borderRadius: '4px' }}
            />
          )}
        </label>

        <label className="field">
          <span>Description</span>
          <textarea rows={4} value={form.description} onChange={handleChange('description')} />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save category'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CategoryFormPage
