const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { isNonEmptyString, isValidEmail } = require('../utils/validators')
const authService = require('../services/authService')
const userModel = require('../models/userModel')
const cloudinary = require('../config/cloudinary')

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body
  const errors = []

  if (!isNonEmptyString(name)) errors.push('name is required')
  if (!isValidEmail(email)) errors.push('a valid email is required')
  if (!isNonEmptyString(password) || password.length < 6) {
    errors.push('password must be at least 6 characters')
  }

  if (errors.length) throw new ApiError(400, 'Validation failed', errors)

  const { user, token } = await authService.register({ name, email, phone, password })
  res.status(201).json({ user, token })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const errors = []

  if (!isValidEmail(email)) errors.push('a valid email is required')
  if (!isNonEmptyString(password)) errors.push('password is required')

  if (errors.length) throw new ApiError(400, 'Validation failed', errors)

  const { user, token } = await authService.login({ email, password })
  res.json({ user, token })
})

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided')

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bamboo-store/avatars', resource_type: 'image' },
      (err, uploaded) => (err ? reject(err) : resolve(uploaded))
    )
    stream.end(req.file.buffer)
  })

  const user = await userModel.updateAvatar(req.user.id, result.secure_url)
  res.json({ user })
})

module.exports = { register, login, uploadAvatar }
