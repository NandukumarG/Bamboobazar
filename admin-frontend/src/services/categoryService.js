import api from './api'

export const getCategories = async () => {
  const { data } = await api.get('/admin/categories')
  return data.categories
}

export const getCategory = async (id) => {
  const { data } = await api.get(`/admin/categories/${id}`)
  return data.category
}

export const createCategory = async (payload) => {
  const { data } = await api.post('/admin/categories', payload)
  return data.category
}

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/admin/categories/${id}`, payload)
  return data.category
}

export const updateCategoryStatus = async (id, isActive) => {
  const { data } = await api.patch(`/admin/categories/${id}/status`, { isActive })
  return data.category
}

export const uploadCategoryImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await api.post('/admin/categories/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}
