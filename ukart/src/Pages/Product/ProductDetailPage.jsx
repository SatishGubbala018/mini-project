import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './ProductDetailPage.css'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`

const featureList = [
  'Powerful 40mm Dynamic Drivers',
  'Up to 60 Hours Battery Life',
  'Bluetooth 5.3 for Seamless Connectivity',
  'Lightweight and Comfortable Design',
]

const ProductDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToCart, cartCount, items, updateQuantity, removeItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [isBuying, setIsBuying] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://dummyjson.com/products/${id}`)
        const data = await response.json()
        console.log('Fetched product details:', data)
        setProduct(data)
      } catch (error) {
        console.error('Unable to fetch product details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="product-page state-page">
        <div className="loader-box">
          <span className="loader-spinner" />
          <span>Loading product details...</span>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-page state-page">
        <div className="not-found-box">
          <h2>Product not found</h2>
          <Link to="/" className="back-link">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const gallery = product.images && product.images.length ? product.images : [product.thumbnail]
  const currentPrice = Math.round(product.price * 90)
  const originalPrice = Math.round((product.price * 90 * (100 + (product.discountPercentage || 20))) / 100)
  const currentCartItem = items.find((item) => item.id === Number(id)) || null
  const cartQuantity = currentCartItem ? currentCartItem.quantity : 0

  const handleProductAdd = () => {
    if (!product) return

    if (cartQuantity >= (product.stock || 67)) {
      return
    }

    addToCart(product, 1)
  }

  const handleIncrement = () => {
    if (!product) return

    if (cartQuantity >= (product.stock || 67)) {
      return
    }

    updateQuantity(Number(id), cartQuantity + 1)
  }

  const handleDecrement = () => {
    if (!currentCartItem) return

    if (cartQuantity <= 1) {
      removeItem(Number(id))
      return
    }

    updateQuantity(Number(id), cartQuantity - 1)
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }

    if (cartQuantity >= (product.stock || 67)) {
      return
    }

    addToCart(product, 1)
    setIsBuying(true)
    setTimeout(() => {
      navigate('/cart')
    }, 500)
  }

  return (
    <div className="product-page page-enter">
      <div className="product-shell">
        <header className="product-topbar">
          <div className="page-header-left">
            <button type="button" className="back-home-btn" onClick={() => navigate('/')}>
              ←
            </button>
            <button type="button" className="brand-lockup brand-button" aria-label="Ukart home" onClick={() => navigate('/')}>
              <span className="brand-mark-small" />
              <span className="brand-text">Ukart</span>
            </button>
          </div>

          <label className="search-box" aria-label="Search products">
            <span className="search-label">Search for products...</span>
            <span className="search-icon">⌕</span>
          </label>

          <div className="top-actions" aria-label="User actions">
            <button type="button" className="action-pill" aria-label="Profile">◔</button>
            <button type="button" className="action-pill" aria-label="Saved items">♡</button>
            <button type="button" className="action-pill" aria-label="Cart" onClick={() => navigate('/cart')}>
              🛒
              <span className="badge">{cartCount}</span>
            </button>
          </div>
        </header>

        <section className="product-card-layout">
          <div className="gallery-panel">
            <div className="thumb-column">
              {gallery.map((image, index) => (
                <button
                  key={`${product.id}-${index}`}
                  type="button"
                  className={`thumb-btn ${activeImage === index ? 'selected' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>

            <div className="hero-product-frame">
              <span className="discount-badge">{Math.round(product.discountPercentage)}% OFF</span>
              <button type="button" className="wishlist-action" aria-label="Save product">
                ♡
              </button>
              <img src={gallery[activeImage]} alt={product.title} />
            </div>
          </div>

          <div className="detail-panel">
            <div className="detail-heading">
              <h2>{product.title}</h2>
              <button type="button" className="wishlist-action small" aria-label="Save product">
                ♡
              </button>
            </div>

            <div className="rating-row">
              <span className="rating-pill">★ {product.rating}</span>
              <span className="reviews-pill">{product.stock} left</span>
            </div>

            <div className="price-row-detail">
              <span className="current-price">{formatPrice(currentPrice)}</span>
              <span className="old-price">{formatPrice(originalPrice)}</span>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="feature-icons">
              <div className="feature-icon-box">
                <span>◔</span>
                <small>Powerful</small>
                <strong>40 mm</strong>
              </div>
              <div className="feature-icon-box">
                <span>◍</span>
                <small>60 Hours</small>
                <strong>Playback</strong>
              </div>
              <div className="feature-icon-box">
                <span>◌</span>
                <small>Bluetooth</small>
                <strong>5.3</strong>
              </div>
            </div>

            <div className="purchase-actions">
              {cartQuantity === 0 ? (
                <button type="button" className="add-cart-btn" aria-live="polite" onClick={handleProductAdd}>
                  🛒 Add to Cart
                </button>
              ) : (
                <div className="quantity-stepper" aria-live="polite">
                  <button type="button" className="qty-step-btn" onClick={handleDecrement} aria-label="Decrease quantity">−</button>
                  <span className="qty-value">{cartQuantity}</span>
                  <button type="button" className="qty-step-btn" onClick={handleIncrement} aria-label="Increase quantity">+</button>
                </div>
              )}

              <button
                type="button"
                className={`buy-now-btn ${isBuying ? 'buying' : ''}`}
                onClick={handleBuyNow}
              >
                {isBuying ? 'Preparing checkout...' : '⚡ Buy Now'}
              </button>
            </div>
          </div>
        </section>

        <section className="info-section">
          <div className="tabs-row">
            <button type="button" className="tab active">Description</button>
            <button type="button" className="tab">Specifications</button>
            <button type="button" className="tab">Reviews ({product.rating * 1200})</button>
          </div>

          <div className="details-grid">
            <div className="feature-card">
              <h3>About this item</h3>
              <ul>
                {featureList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="promo-card">
              <div className="promo-copy">
                <h3>Feel the</h3>
                <h3>Music Vibe</h3>
                <p>With {product.brand} {product.title}</p>
              </div>
              <img src={gallery[0]} alt={product.title} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductDetailPage
