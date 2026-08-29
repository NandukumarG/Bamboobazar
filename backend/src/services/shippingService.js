const shiprocket = require('../config/shiprocket')
const ApiError = require('../utils/ApiError')
const { shiprocketRequest } = require('./shiprocketClient')

// Shiprocket's serviceability API returns every courier that can ship a
// route along with its rate: https://apiv2.shiprocket.in/v1/external/courier/serviceability
const calculateShippingFee = async ({ destinationPincode, paymentMethod = 'ONLINE' }) => {
  const params = new URLSearchParams({
    pickup_postcode: shiprocket.originPincode,
    delivery_postcode: destinationPincode,
    weight: String(shiprocket.defaultWeightKg),
    cod: paymentMethod === 'COD' ? '1' : '0',
  })

  const { ok, data } = await shiprocketRequest(`courier/serviceability/?${params}`)
  const companies = data?.data?.available_courier_companies

  if (!ok || !Array.isArray(companies) || companies.length === 0) {
    throw new ApiError(400, 'Delivery is not available for this pincode')
  }

  const cheapest = companies.reduce((min, company) =>
    Number(company.rate) < Number(min.rate) ? company : min
  )

  return Math.round(Number(cheapest.rate))
}

module.exports = { calculateShippingFee }
