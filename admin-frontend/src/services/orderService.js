import api from './api'

export const getOrders = async () => {
  const { data } = await api.get('/admin/orders')
  return data.orders
}

export const getOrder = async (id) => {
  const { data } = await api.get(`/admin/orders/${id}`)
  return data.order
}

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.patch(`/admin/orders/${id}/status`, { status })
  return data.order
}

export const createShipment = async (id) => {
  const { data } = await api.post(`/admin/orders/${id}/shipment`)
  return data.order
}
