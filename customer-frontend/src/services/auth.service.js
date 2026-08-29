import api from './api'

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export const register = async ({ name, email, phone, password }) => {
  const { data } = await api.post('/auth/register', { name, email, phone, password })
  return data
}

export const uploadAvatar = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await api.post('/auth/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.user
}
