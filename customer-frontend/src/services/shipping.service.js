import api from './api'

export const getShippingQuote = async ({ pincode, paymentMethod }) => {
  const { data } = await api.get('/shipping/quote', { params: { pincode, paymentMethod } })
  return data.shipping
}
