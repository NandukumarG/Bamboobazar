const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

const isValidEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0

const isNonNegativeNumber = (value) =>
  typeof value === 'number' && !Number.isNaN(value) && value >= 0

const isBoolean = (value) => typeof value === 'boolean'

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isPositiveInteger,
  isNonNegativeNumber,
  isBoolean,
}
