const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let loadPromise = null

// Loads the Razorpay Checkout script once and reuses the same promise for
// subsequent calls, so re-opening the payment page doesn't inject it twice.
export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true)

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.onload = () => resolve(true)
      script.onerror = () => {
        loadPromise = null
        reject(new Error('Failed to load Razorpay checkout script.'))
      }
      document.body.appendChild(script)
    })
  }

  return loadPromise
}
