const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const shippingService = require('../services/shippingService')

const getQuote = asyncHandler(async (req, res) => {
  const { pincode, paymentMethod } = req.query

  if (!/^\d{6}$/.test(pincode || '')) {
    throw new ApiError(400, 'A valid 6-digit pincode is required')
  }

  const shipping = await shippingService.calculateShippingFee({
    destinationPincode: pincode,
    paymentMethod,
  })

  res.json({ shipping })
})

module.exports = { getQuote }
