import api from './api'

export const getCategories = async () => {
  const { data } = await api.get('/categories')
  return data.categories
}

export const getCategory = async (slug) => {
  const { data } = await api.get(`/categories/${slug}`)
  return data.category
}
