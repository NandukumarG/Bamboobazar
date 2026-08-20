import api from './api'

export const getDashboardStats = async () => {
  const { data } = await api.get('/admin/dashboard')
  return data.stats
}
