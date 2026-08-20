import { createContext, useContext, useEffect, useState } from 'react'
import { CART_KEY } from '../utils/cartStorage'

const CartContext = createContext(null)

const readCart = () => {
  try {
    const stored = localStorage.getItem(CART_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  // Cart entries snapshot price/stock at add-time purely for display — the
  // backend re-reads price and stock from PostgreSQL when the order is placed.
  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const maxQuantity = product.stock
      const existing = prev.find((item) => item.productId === product.id)

      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, maxQuantity)
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: nextQuantity } : item
        )
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          imageUrl: product.image_url,
          price: Number(product.selling_price),
          stock: product.stock,
          quantity: Math.max(1, Math.min(quantity, maxQuantity)),
        },
      ]
    })
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    )
  }

  const clearCart = () => setItems([])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
