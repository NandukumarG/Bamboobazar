const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const productModel = require('../models/productModel')

const listProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query
  const parsedLimit = Math.min(Number(limit) || 20, 100)
  const parsedPage = Math.max(Number(page) || 1, 1)
  const offset = (parsedPage - 1) * parsedLimit

  const products = await productModel.findListedProducts({
    categorySlug: category,
    search,
    limit: parsedLimit,
    offset,
  })

  res.json({ products, page: parsedPage, limit: parsedLimit })
})

const getProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid product id')

  const product = await productModel.findListedById(id)
  if (!product) throw new ApiError(404, 'Product not found')

  res.json({ product })
})

module.exports = { listProducts, getProduct }
