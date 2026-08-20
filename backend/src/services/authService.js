const bcrypt = require('bcrypt')
const userModel = require('../models/userModel')
const ApiError = require('../utils/ApiError')
const { signToken } = require('../utils/jwt')

const SALT_ROUNDS = 10

const register = async ({ name, email, phone, password }) => {
  const existing = await userModel.findByEmail(email)
  if (existing) {
    throw new ApiError(409, 'Email is already registered')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await userModel.createUser({ name, email, phone, passwordHash })
  const token = signToken({ id: user.id, role: user.role })

  return { user, token }
}

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email)
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const token = signToken({ id: user.id, role: user.role })
  const { password_hash, ...safeUser } = user

  return { user: safeUser, token }
}

module.exports = { register, login }
