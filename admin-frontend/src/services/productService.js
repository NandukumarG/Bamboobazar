import api from './api'

export const getProducts = async () => {
  const { data } = await api.get('/admin/products')
  return data.products
}

export const getProduct = async (id) => {
  const { data } = await api.get(`/admin/products/${id}`)
  return data.product
}

export const createProduct = async (payload) => {
  const { data } = await api.post('/admin/products', payload)
  return data.product
}

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/admin/products/${id}`, payload)
  return data.product
}

export const updateProductStatus = async (id, isListed) => {
  const { data } = await api.patch(`/admin/products/${id}/status`, { isListed })
  return data.product
}

export const deleteProduct = async (id) => {
  await api.delete(`/admin/products/${id}`)
}
