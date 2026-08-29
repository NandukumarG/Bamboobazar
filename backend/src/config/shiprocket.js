// Origin pincode defaults to Bengaluru (560001) since that's where the
// warehouse ships from. email/password stay null when unset so the rest of
// the API (auth, products, orders) can still start without Shiprocket configured.
const shiprocket = {
  email: process.env.SHIPROCKET_EMAIL || null,
  password: process.env.SHIPROCKET_PASSWORD || null,
  baseUrl: process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external',
  originPincode: process.env.SHIPROCKET_ORIGIN_PINCODE || '560001',
  defaultWeightKg: Number(process.env.SHIPROCKET_DEFAULT_WEIGHT_KG) || 0.5,
  // Must exactly match a pickup address nickname already configured in the
  // Shiprocket dashboard (Settings > Pickup Addresses) — used when creating
  // a shipment, not for the checkout-time rate quote. No sensible default
  // exists across accounts, so leave unset rather than guess wrong.
  pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || null,
  defaultLengthCm: Number(process.env.SHIPROCKET_DEFAULT_LENGTH_CM) || 10,
  defaultBreadthCm: Number(process.env.SHIPROCKET_DEFAULT_BREADTH_CM) || 10,
  defaultHeightCm: Number(process.env.SHIPROCKET_DEFAULT_HEIGHT_CM) || 10,
}

module.exports = shiprocket
