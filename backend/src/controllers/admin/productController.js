const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const {
  isNonEmptyString,
  isNonNegativeNumber,
  isPositiveInteger,
  isBoolean,
} = require('../../utils/validators')
const slugify = require('../../utils/slugify')
const { computeSellingPrice } = require('../../utils/price')
const productModel = require('../../models/productModel')

const parseProductInput = (body) => {
  const errors = []

  if (!isPositiveInteger(body.categoryId)) errors.push('categoryId must be a positive integer')
  if (!isNonEmptyString(body.name)) errors.push('name is required')
  if (!isNonEmptyString(body.productCode)) errors.push('productCode is required')
  if (!isNonNegativeNumber(body.originalPrice)) {
    errors.push('originalPrice must be a non-negative number')
  }
  if (!isNonNegativeNumber(body.discount) || body.discount > 100) {
    errors.push('discount must be a number between 0 and 100')
  }
  if (!Number.isInteger(body.stock) || body.stock < 0) {
    errors.push('stock must be a non-negative integer')
  }

  if (errors.length) throw new ApiError(400, 'Validation failed', errors)

  const slug = isNonEmptyString(body.slug) ? slugify(body.slug) : slugify(body.name)
  const sellingPrice = computeSellingPrice(body.originalPrice, body.discount)

  return {
    categoryId: body.categoryId,
    name: body.name.trim(),
    slug,
    description: body.description || null,
    productCode: body.productCode.trim(),
    originalPrice: body.originalPrice,
    discount: body.discount,
    sellingPrice,
    stock: body.stock,
    imageUrl: body.imageUrl || null,
  }
}

const listProducts = asyncHandler(async (req, res) => {
  const products = await productModel.findAllAdmin()
  res.json({ products })
})

const getProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid product id')

  const product = await productModel.findByIdAdmin(id)
  if (!product) throw new ApiError(404, 'Product not found')

  res.json({ product })
})

const createProduct = asyncHandler(async (req, res) => {
  const data = parseProductInput(req.body)
  const isListed = req.body.isListed === undefined ? true : req.body.isListed
  if (!isBoolean(isListed)) {
    throw new ApiError(400, 'Validation failed', ['isListed must be a boolean'])
  }

  const product = await productModel.createProduct({ ...data, isListed })
  res.status(201).json({ product })
})

const updateProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid product id')

  const existing = await productModel.findByIdAdmin(id)
  if (!existing) throw new ApiError(404, 'Product not found')

  const data = parseProductInput(req.body)
  const product = await productModel.updateProduct(id, data)
  res.json({ product })
})

const updateProductStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid product id')

  const { isListed } = req.body
  if (!isBoolean(isListed)) {
    throw new ApiError(400, 'Validation failed', ['isListed must be a boolean'])
  }

  const existing = await productModel.findByIdAdmin(id)
  if (!existing) throw new ApiError(404, 'Product not found')

  const product = await productModel.updateStatus(id, isListed)
  res.json({ product })
})

const deleteProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid product id')

  const deleted = await productModel.deleteProduct(id)
  if (!deleted) throw new ApiError(404, 'Product not found')

  res.status(204).send()
})

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
}
