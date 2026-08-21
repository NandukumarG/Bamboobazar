import api from './api'

export const createRazorpayOrder = async (orderId) => {
  const { data } = await api.post('/payments/create-order', { orderId })
  return data
}

export const verifyPayment = async (payload) => {
  const { data } = await api.post('/payments/verify', payload)
  return data
}

export const markPaymentFailed = async (payload) => {
  const { data } = await api.post('/payments/failed', payload)
  return data
}
