import axios from 'axios'
import { TOKEN_KEY, USER_KEY } from '../utils/authStorage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Public browsing (home/products/categories) never requires auth, so a
    // stray 401 just means a stale token — clear it but don't force-redirect;
    // ProtectedRoute already gates the pages that actually need a session.
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
    return Promise.reject(error)
  }
)

export default api
