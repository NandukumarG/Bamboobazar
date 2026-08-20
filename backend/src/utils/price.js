const computeSellingPrice = (originalPrice, discount) => {
  const price = originalPrice - (originalPrice * discount) / 100
  return Math.round(price * 100) / 100
}

module.exports = { computeSellingPrice }
