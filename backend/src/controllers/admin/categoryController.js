const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const { isNonEmptyString, isBoolean } = require('../../utils/validators')
const slugify = require('../../utils/slugify')
const categoryModel = require('../../models/categoryModel')
const cloudinary = require('../../config/cloudinary')

const parseCategoryInput = (body) => {
  const errors = []
  if (!isNonEmptyString(body.name)) errors.push('name is required')
  if (errors.length) throw new ApiError(400, 'Validation failed', errors)

  const slug = isNonEmptyString(body.slug) ? slugify(body.slug) : slugify(body.name)

  return {
    name: body.name.trim(),
    slug,
    description: body.description || null,
    imageUrl: body.imageUrl || null,
  }
}

const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryModel.findAllAdmin()
  res.json({ categories })
})

const getCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid category id')

  const category = await categoryModel.findByIdAdmin(id)
  if (!category) throw new ApiError(404, 'Category not found')

  res.json({ category })
})

const createCategory = asyncHandler(async (req, res) => {
  const data = parseCategoryInput(req.body)
  const isActive = req.body.isActive === undefined ? true : req.body.isActive
  if (!isBoolean(isActive)) {
    throw new ApiError(400, 'Validation failed', ['isActive must be a boolean'])
  }

  const category = await categoryModel.createCategory({ ...data, isActive })
  res.status(201).json({ category })
})

const updateCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid category id')

  const existing = await categoryModel.findByIdAdmin(id)
  if (!existing) throw new ApiError(404, 'Category not found')

  const data = parseCategoryInput(req.body)
  const category = await categoryModel.updateCategory(id, data)
  res.json({ category })
})

const updateCategoryStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid category id')

  const { isActive } = req.body
  if (!isBoolean(isActive)) {
    throw new ApiError(400, 'Validation failed', ['isActive must be a boolean'])
  }

  const existing = await categoryModel.findByIdAdmin(id)
  if (!existing) throw new ApiError(404, 'Category not found')

  const category = await categoryModel.updateStatus(id, isActive)
  res.json({ category })
})

const uploadCategoryImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided')

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bamboo-store/categories', resource_type: 'image' },
      (err, uploaded) => (err ? reject(err) : resolve(uploaded))
    )
    stream.end(req.file.buffer)
  })

  res.status(201).json({ url: result.secure_url })
})

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  uploadCategoryImage,
}
