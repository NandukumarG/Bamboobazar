const CART_KEY_PREFIX = 'bamboo_customer_cart:'

// Each identity (a logged-in user, or the anonymous "guest" browsing without
// an account) gets its own cart slot, so logging into an account restores
// that account's cart instead of sharing one cart across everyone.
export const getCartStorageKey = (userId) => `${CART_KEY_PREFIX}${userId || 'guest'}`
