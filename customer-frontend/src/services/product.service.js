import api from './api'

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params })
  return data.products
}

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return data.product
}
