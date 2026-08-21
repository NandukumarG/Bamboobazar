const Razorpay = require('razorpay')

// Only instantiate the SDK when both keys are present — an unconfigured
// Razorpay (e.g. local dev before test keys are set up) must not prevent
// the rest of the API (auth, products, orders) from starting at all.
const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null

module.exports = razorpay
