const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const categoryModel = require('../models/categoryModel')

const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryModel.findActiveCategories()
  res.json({ categories })
})

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryModel.findActiveBySlug(req.params.slug)
  if (!category) throw new ApiError(404, 'Category not found')
  res.json({ category })
})

module.exports = { listCategories, getCategoryBySlug }
