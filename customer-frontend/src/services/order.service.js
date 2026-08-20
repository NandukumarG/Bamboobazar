import api from './api'

// Only productId + quantity are ever sent for order items — the backend looks
// up current price and stock from PostgreSQL and computes the total itself.
export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload)
  return data.order
}

export const getOrders = async () => {
  const { data } = await api.get('/orders')
  return data.orders
}

export const getOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`)
  return data.order
}
