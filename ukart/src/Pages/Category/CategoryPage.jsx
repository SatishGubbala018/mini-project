import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './CategoryPage.css'

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`

const getDisplayCategory = (category) => {
  const normalized = String(category || '').toLowerCase()

  if (normalized.includes('phone') || normalized.includes('smartphone') || normalized.includes('mobile')) return 'Mobiles'
  if (normalized.includes('laptop') || normalized.includes('computer') || normalized.includes('electronics')) return 'Electronics'
  if (normalized.includes('watch') || normalized.includes('audio') || normalized.includes('headphone') || normalized.includes('speaker')) return 'Audio'
  if (normalized.includes('shoe') || normalized.includes('sandal') || normalized.includes('boot')) return 'Footwear'
  if (normalized.includes('home') || normalized.includes('furniture') || normalized.includes('decor')) return 'Home'
  if (normalized.includes('bag') || normalized.includes('dress') || normalized.includes('shirt') || normalized.includes('top') || normalized.includes('skirt') || normalized.includes('jewelry') || normalized.includes('perfume')) return 'Fashion'

  return 'Fashion'
}

const CategoryPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { category } = useParams()
  const queryParams = new URLSearchParams(location.search)
  const searchQuery = queryParams.get('q')
  const selectedCategory = decodeURIComponent(category || 'All')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const apiUrl = searchQuery
          ? `https://dummyjson.com/products/search?q=${encodeURIComponent(searchQuery)}&limit=20`
          : 'https://dummyjson.com/products?limit=20'

        const response = await fetch(apiUrl)
        const data = await response.json()
        const allItems = data.products || []

        const filtered = selectedCategory === 'All'
          ? allItems
          : allItems.filter((product) => getDisplayCategory(product.category) === selectedCategory)

        setProducts(filtered)
      } catch (error) {
        console.error('Unable to fetch category products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, searchQuery])

  const productsToShow = useMemo(() => products.slice(0, 20), [products])
  const pageHeading = searchQuery ? `Results for "${searchQuery}"` : selectedCategory

  return (
    <div className="category-page-shell">
      <div className="category-page">
        <header className="category-topbar">
          <div className="brand-lockup" aria-label="Ukart logo">
            <span className="brand-mark-small" />
            <span className="brand-text">Ukart</span>
          </div>

          <div className="top-actions" aria-label="User actions">
            <button type="button" className="action-pill" aria-label="Profile">◔</button>
            <button type="button" className="action-pill" aria-label="Saved items">♡</button>
            <button type="button" className="action-pill" aria-label="Cart" onClick={() => navigate('/cart')}>🛒</button>
          </div>
        </header>

        <div className="category-banner">
          <button type="button" className="back-home-btn" onClick={() => navigate('/')}>
            ← Back to home
          </button>
          <h1>{pageHeading}</h1>
          <p>{productsToShow.length} products ready for you</p>
        </div>

        {loading ? (
          <div className="category-loading">
            <span className="loader-spinner" />
            <span>Loading {selectedCategory} products...</span>
          </div>
        ) : (
          <div className="category-product-scroll">
            <div className="category-product-grid">
              {productsToShow.length ? (
                productsToShow.map((product) => {
                  const priceInRupees = Math.round(product.price * 90)
                  const originalPrice = Math.round((product.price * 90 * (100 + (product.discountPercentage || 12))) / 100)

                  return (
                    <article
                      key={product.id}
                      className="category-product-card"
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
                      <div className="category-product-image-wrap">
                        <img src={product.thumbnail} alt={product.title} />
                      </div>

                      <h3>{product.title}</h3>

                      <div className="product-meta">
                        <span className="rating-badge">★ {product.rating}</span>
                        <span>{product.stock} left</span>
                      </div>

                      <div className="price-row">
                        <span className="current-price">{formatPrice(priceInRupees)}</span>
                        <span className="old-price">{formatPrice(originalPrice)}</span>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="empty-category-state">No products found for this category.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
