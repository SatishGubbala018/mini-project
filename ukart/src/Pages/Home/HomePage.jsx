import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { LayoutGrid, Shirt, Laptop, Smartphone, Headphones, Footprints, Sofa } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'


const categories = [
  { name: 'All', Icon: LayoutGrid },
  { name: 'Fashion', Icon: Shirt },
  { name: 'Electronics', Icon: Laptop },
  { name: 'Mobiles', Icon: Smartphone },
  { name: 'Audio', Icon: Headphones },
  { name: 'Footwear', Icon: Footprints },
  { name: 'Home', Icon: Sofa },
]

const allCategoryGroups = ['Fashion', 'Mobiles', 'Electronics', 'Audio', 'Footwear', 'Home']
const hiddenHomeGroups = new Set([])

const quickPerks = [
  { title: 'Free Shipping', detail: 'On Orders Above ₹999' },
  { title: 'Secure Payments', detail: '100% Secure' },
  { title: '24/7 Support', detail: 'Always Here' },
]

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`

const getDisplayCategory = (category) => {
  const normalized = String(category || '').toLowerCase()

  if (
    normalized.includes('phone') ||
    normalized.includes('smartphone') ||
    normalized.includes('mobile') ||
    normalized.includes('camera')
  ) return 'Mobiles'

  if (
    normalized.includes('laptop') ||
    normalized.includes('tablet') ||
    normalized.includes('electronic') ||
    normalized.includes('monitor') ||
    normalized.includes('accessory') ||
    normalized.includes('computer')
  ) return 'Electronics'

  if (
    normalized.includes('audio') ||
    normalized.includes('headphone') ||
    normalized.includes('speaker') ||
    normalized.includes('earphone') ||
    normalized.includes('bluetooth')
  ) return 'Audio'

  if (
    normalized.includes('shoe') ||
    normalized.includes('sandal') ||
    normalized.includes('boot') ||
    normalized.includes('sneaker') ||
    normalized.includes('heel')
  ) return 'Footwear'

  if (
    normalized.includes('home') ||
    normalized.includes('furniture') ||
    normalized.includes('decor') ||
    normalized.includes('living') ||
    normalized.includes('kitchen')
  ) return 'Home'

  if (
    normalized.includes('bag') ||
    normalized.includes('dress') ||
    normalized.includes('shirt') ||
    normalized.includes('top') ||
    normalized.includes('skirt') ||
    normalized.includes('jewelry') ||
    normalized.includes('perfume') ||
    normalized.includes('fashion') ||
    normalized.includes('cloth') ||
    normalized.includes('sunglasses') ||
    normalized.includes('watch') ||
    normalized.includes('woman') ||
    normalized.includes('men') ||
    normalized.includes('women')
  ) return 'Fashion'

  return 'Fashion'
}

const HomePage = () => {
  const navigate = useNavigate()
  const { cartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const heroRef = useRef(null)
  const carouselRefs = useRef({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products?limit=500')
        const data = await response.json()
        console.log('Fetched products:', data)
        setProducts(data.products || [])
      } catch (error) {
        console.error('Unable to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()
    const trimmed = searchTerm.trim()

    if (!trimmed) {
      setSelectedCategory('All')
      return
    }

    navigate(`/category/All?q=${encodeURIComponent(trimmed)}`)
  }

  const categoryGroups = allCategoryGroups
    .map((category) => ({
      name: category,
      items: products.filter((product) => getDisplayCategory(product.category) === category).slice(0, 20),
    }))
    .filter((group) => group.items.length > 0)

  const scrollCarousel = (category, direction) => {
    const element = carouselRefs.current[category]
    if (!element) return
    element.scrollBy({ left: direction * Math.min(element.clientWidth * 0.8, 700), behavior: 'smooth' })
  }

  return (
    <div className="home-page page-enter">
      <div className="home-layout">
        <main className="home-main page-enter-card">
          <header className="topbar">
            <button type="button" className="brand-lockup brand-button" aria-label="Ukart home" onClick={() => navigate('/')}>
              <span className="brand-mark-small" />
              <span className="brand-text">Ukart</span>
            </button>

            <form className="search-box" aria-label="Search products" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search for products..."
                aria-label="Search for products"
              />
              <button type="submit" className="search-icon" aria-label="Search">⌕</button>
            </form>

            <div className="top-actions" aria-label="User actions">
              <button
                type="button"
                className="action-pill profile-pill"
                aria-label="Profile"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                title={isAuthenticated ? user?.name || 'Profile' : 'Login'}
              >
                {isAuthenticated ? (user?.name ? user.name.charAt(0).toUpperCase() : 'P') : '◔'}
              </button>
              <button type="button" className="action-pill" aria-label="Saved items">♡</button>
              {isAuthenticated && (
                <button
                  type="button"
                  className="action-pill logout-pill"
                  aria-label="Logout"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  ↵
                </button>
              )}
              <button type="button" className="action-pill" aria-label="Cart" onClick={() => navigate('/cart')}>
                🛒
                <span className="badge">{cartCount}</span>
              </button>
            </div>
          </header>

          <section className="hero-panel">
            <div className="hero-copy">
              <h1>
                Ukart
                <span>Shop Smart.</span>
                <span>Live Better.</span>
              </h1>

              <p>Discover amazing deals on fashion, electronics and more!</p>

              <button type="button" className="shop-btn" onClick={() => document.querySelector('.category-strip')?.scrollIntoView({ behavior: 'smooth' })}>
                Shop Now <span>→</span>
              </button>
            </div>

            <div className="hero-visual">
              <div className="hero-glow" />
              
            </div>
          </section>

          <nav className="category-strip" aria-label="Categories">
            {categories.map((category) => {
              const Icon = category.Icon
              return (
                <button
                  type="button"
                  key={category.name}
                  className={`category-pill ${selectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="category-icon-wrap" aria-hidden="true">
                    <Icon size={26} strokeWidth={1.9} />
                  </span>
                  <span>{category.name}</span>
                </button>
              )
            })}
          </nav>

          <section className="offers-row">
            <article className="offer-card soft-pink">
              <div>
                <h3>Latest Fashion Trends</h3>
                <p>Up to 60% Off</p>
                <button type="button" onClick={() => navigate('/category/Fashion')}>Shop Fashion →</button>
              </div>
            </article>

            <article className="offer-card vibrant-purple">
              <div>
                <h3>Top Electronics Best Prices</h3>
                <p>Up to 50% Off</p>
                <button type="button" onClick={() => navigate('/category/Electronics')}>Shop Electronics →</button>
              </div>
            </article>
          </section>

          <section className="product-panel">
            {loading ? (
              <div className="loading-state">
                <span className="loader-spinner" />
                <span>Loading products...</span>
              </div>
            ) : (
              categoryGroups.map((group) => (
                <div key={group.name} className="category-section">
                  <div className="section-head">
                    <h2>{group.name}</h2>
                    <div className="carousel-controls">
                      <button
                        type="button"
                        className="scroll-button left"
                        onClick={() => scrollCarousel(group.name, -1)}
                        aria-label="Scroll left"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        className="scroll-button right"
                        onClick={() => scrollCarousel(group.name, 1)}
                        aria-label="Scroll right"
                      >
                        ▶
                      </button>
                    </div>
                    <button type="button" onClick={() => navigate(`/category/${encodeURIComponent(group.name)}`)}>
                      View All →
                    </button>
                  </div>

                  <div className="product-grid" ref={(el) => (carouselRefs.current[group.name] = el)}>
                    {group.items.length ? (
                      group.items.map((product) => {
                        const priceInRupees = Math.round(product.price * 90)
                        const originalPrice = Math.round((product.price * 90 * (100 + product.discountPercentage)) / 100)

                        return (
                          <article
                            key={product.id}
                            className="product-card"
                            onClick={() => navigate(`/product/${product.id}`)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                navigate(`/product/${product.id}`)
                              }
                            }}
                            tabIndex={0}
                            role="button"
                          >
                            <button type="button" className="wishlist" aria-label="Save product" onClick={(event) => event.stopPropagation()}>
                              ♡
                            </button>

                            <div className="product-image-wrap">
                              <img src={product.thumbnail} alt={product.title} loading="lazy" />
                            </div>

                            <h3>{product.title}</h3>

                            <div className="product-meta">
                              <span className="rating-badge">★ {product.rating}</span>
                              <span className="stock-count">{product.stock} left</span>
                            </div>

                            <div className="price-row">
                              <div className="price-stack">
                                <span className="current-price">{formatPrice(priceInRupees)}</span>
                                <span className="old-price">{formatPrice(originalPrice)}</span>
                              </div>
                            </div>
                            {Number(product.discountPercentage) > 0 && (
                              <span className="discount-badge">{Math.round(product.discountPercentage)}% OFF</span>
                            )}
                          </article>
                        )
                      })
                    ) : (
                      <div className="empty-state">No products in this category.</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>

          <div className="trust-row">
            {quickPerks.map((perk) => (
              <div key={perk.title} className="trust-item">
                <span className="trust-icon">✓</span>
                <div>
                  <strong>{perk.title}</strong>
                  <small>{perk.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomePage
