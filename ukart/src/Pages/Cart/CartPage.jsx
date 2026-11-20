import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import './CartPage.css'

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`

const CartPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()
  const { items, subtotal, discount, total, updateQuantity, removeItem, clearCart } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [address, setAddress] = useState({ fullName: user?.name || '', phone: user?.phone || '', addressLine: '', city: '', state: '', pincode: '' })

  useEffect(() => {
    if (!checkoutOpen || !token) return
    fetch('/api/shop/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((profile) => {
        if (profile.address) setAddress((current) => ({ ...current, ...profile.address, fullName: profile.address.fullName || profile.name, phone: profile.address.phone || profile.phone }))
      })
      .catch(() => {})
  }, [checkoutOpen, token])

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    setCheckoutMessage('')
    setCheckoutOpen(true)
  }

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setPlacingOrder(true)
    setCheckoutMessage('')
    try {
      const response = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items, address, paymentMethod: 'COD' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to place order.')
      clearCart()
      setCheckoutOpen(false)
      navigate('/profile')
    } catch (error) {
      setCheckoutMessage(error.message)
    } finally {
      setPlacingOrder(false)
    }
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
            <button type="button" className="action-pill" aria-label="Profile" onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}>◔</button>
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
              <button type="button" className="clear-cart-btn" onClick={clearCart}>
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

              <button type="button" className="checkout-btn" onClick={handleCheckout} disabled={placingOrder}>
                {placingOrder ? 'Processing...' : '🛡 Proceed to Checkout →'}
              </button>
            </div>

            {checkoutOpen && (
              <div className="checkout-modal">
                <div className="modal-content">
                  <span className="close" onClick={() => setCheckoutOpen(false)}>&times;</span>
                  <h2>Checkout</h2>

                  <form onSubmit={placeOrder}>
                    <div className="address-form">
                      <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input type="text" id="fullName" name="fullName" value={address.fullName} onChange={handleAddressChange} required />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input type="tel" id="phone" name="phone" value={address.phone} onChange={handleAddressChange} required />
                      </div>

                      <div className="form-group">
                        <label htmlFor="addressLine">Address</label>
                        <input type="text" id="addressLine" name="addressLine" value={address.addressLine} onChange={handleAddressChange} required />
                      </div>

                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input type="text" id="city" name="city" value={address.city} onChange={handleAddressChange} required />
                      </div>

                      <div className="form-group">
                        <label htmlFor="state">State</label>
                        <input type="text" id="state" name="state" value={address.state} onChange={handleAddressChange} required />
                      </div>

                      <div className="form-group">
                        <label htmlFor="pincode">Pincode</label>
                        <input type="text" id="pincode" name="pincode" value={address.pincode} onChange={handleAddressChange} required />
                      </div>
                    </div>

                    <div className="payment-options">
                      <h3>Payment Method</h3>
                      <label className="payment-option selected"><input type="radio" name="payment" checked readOnly /> <span><strong>Cash on Delivery</strong><small>Pay when your order arrives</small></span></label>
                      <label className="payment-option disabled"><input type="radio" name="payment" disabled /> <span><strong>Online Payment</strong><small>Coming soon</small></span></label>
                    </div>

                    {checkoutMessage && <div className="checkout-message">{checkoutMessage}</div>}

                    <div className="modal-actions">
                      <button type="button" className="cancel-btn" onClick={() => setCheckoutOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="place-order-btn" disabled={placingOrder}>
                        {placingOrder ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
