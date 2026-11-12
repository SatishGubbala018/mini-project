import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import './CartPage.css'

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`

const CartPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { items, subtotal, discount, total, updateQuantity, removeItem } = useCart()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }

    alert('Checkout is ready for authenticated users.')
  }

  return (
    <div className="cart-page-shell">
      <div className="cart-page">
        <header className="cart-topbar">
          <button type="button" className="brand-lockup brand-button" aria-label="Ukart home" onClick={() => navigate('/')}>
            <span className="brand-mark-small" />
            <span className="brand-text">Ukart</span>
          </button>

          <label className="search-box" aria-label="Search products">
            <span className="search-label">Search for products...</span>
            <span className="search-icon">⌕</span>
          </label>

          <div className="top-actions" aria-label="User actions">
            <button type="button" className="action-pill" aria-label="Profile">◔</button>
            <button type="button" className="action-pill" aria-label="Saved items">♡</button>
            <button type="button" className="action-pill" aria-label="Cart" onClick={() => navigate('/cart')}>
              🛒
              <span className="badge">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </button>
          </div>
        </header>

        <section className="cart-hero">
          <div className="cart-hero-icon">🛒</div>
          <div>
            <h1>Your Cart</h1>
            <p>Review your items and checkout securely</p>
          </div>
          <div className="cart-hero-art">
            <div className="shopping-bag" />
          </div>
        </section>

        {items.length === 0 ? (
          <div className="empty-cart-box">
            <h2>Your cart is empty</h2>
            <p>Add a few products and come back here.</p>
            <button type="button" className="continue-shopping-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="check-col">
                    <span className="check-mark">✓</span>
                  </div>

                  <div className="product-thumb">
                    <img src={item.image} alt={item.title} />
                  </div>

                  <div className="item-details">
                    <h3>{item.title}</h3>
                    <p>{item.title}</p>
                    <div className="price-line">
                      <span className="current-price">{formatPrice(item.price * 90)}</span>
                      <span className="strike-price">{formatPrice((item.price * 90 * (100 + (item.discountPercentage || 0))) / 100)}</span>
                      <span className="discount-badge">{Math.round(item.discountPercentage || 0)}% OFF</span>
                    </div>
                  </div>

                  <div className="qty-box">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>

                  <button type="button" className="delete-item" aria-label="Remove item" onClick={() => removeItem(item.id)}>
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary-row">
              <button type="button" className="clear-cart-btn" onClick={() => navigate('/')}>
                🗑 Clear Cart
              </button>

              <div className="summary-box">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className="summary-row discount-row">
                  <span>Discount</span>
                  <strong>- {formatPrice(discount)}</strong>
                </div>
                <div className="summary-row">
                  <span>Delivery Charges</span>
                  <strong>FREE</strong>
                </div>
                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>
            </div>

            <div className="checkout-footer">
              <button type="button" className="back-link-btn" onClick={() => navigate('/')}>
                ← Continue Shopping
              </button>

              <button type="button" className="checkout-btn" onClick={handleCheckout}>
                🛡 Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
