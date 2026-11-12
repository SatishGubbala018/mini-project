import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'ukart-cart-items'

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return []

    try {
      const saved = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch (error) {
      return []
    }
  })

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (product, quantity = 1) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1)

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        )
      }

      return [
        ...current,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price || 0),
          originalPrice: Number((product.price || 0) * (1 + (product.discountPercentage || 0) / 100)),
          discountPercentage: Number(product.discountPercentage || 0),
          image: product.thumbnail || product.images?.[0] || '',
          quantity: safeQuantity,
        },
      ]
    })
  }

  const updateQuantity = (productId, nextQuantity) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Number(nextQuantity) || 0 } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (productId) => {
    setItems((current) => current.filter((item) => item.id !== productId))
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * 90 * item.quantity, 0),
    [items]
  )

  const discount = useMemo(
    () => items.reduce((sum, item) => sum + (item.price * 90 * (item.discountPercentage || 0) / 100) * item.quantity, 0),
    [items]
  )

  const total = subtotal - discount

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeItem,
      cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount,
      total,
    }),
    [discount, items, subtotal, total]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider')
  }

  return context
}
