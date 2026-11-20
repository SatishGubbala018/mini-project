import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './ProfilePage.css'

const emptyAddress = { fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '' }

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const ProfilePage = () => {
  const navigate = useNavigate()
  const { token, user, login, logout } = useAuth()
  const [profile, setProfile] = useState(user || {})
  const [address, setAddress] = useState(emptyAddress)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [profileResponse, ordersResponse] = await Promise.all([
          fetch('/api/shop/profile', { headers }),
          fetch('/api/shop/orders', { headers }),
        ])
        const profileData = await profileResponse.json()
        const ordersData = await ordersResponse.json()
        if (profileResponse.ok) {
          setProfile(profileData)
          setAddress({ ...emptyAddress, ...profileData.address, fullName: profileData.address?.fullName || profileData.name, phone: profileData.address?.phone || profileData.phone })
          login(profileData, token)
        }
        if (ordersResponse.ok) setOrders(ordersData.orders || [])
      } catch (_error) {
        setMessage('Unable to load your profile details.')
      } finally {
        setLoading(false)
      }
    }

    if (token) loadProfile()
  }, [token])

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
  }

  const saveAddress = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/shop/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, address }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to save address.')
      setProfile(data)
      setAddress({ ...emptyAddress, ...data.address })
      login(data, token)
      setMessage('Address saved successfully.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="profile-page profile-state">Loading profile...</div>

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <header className="profile-header">
          <button type="button" className="profile-brand" onClick={() => navigate('/')}><span className="brand-mark-small" /> Ukart</button>
          <div className="profile-header-actions">
            <button type="button" className="profile-back" onClick={() => navigate(-1)}>← Back</button>
            <button
              type="button"
              className="profile-login-btn"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >Logout & Login</button>
          </div>
        </header>

        <section className="profile-hero">
          <div className="profile-avatar">{profile.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <p>Welcome back</p>
            <h1>{profile.name}</h1>
          </div>
        </section>

        <div className="profile-grid">
          <section className="profile-card account-card">
            <h2>My Details</h2>
            <div className="detail-line"><span>Email</span><strong>{profile.email}</strong></div>
            <div className="detail-line"><span>Phone</span><strong>{profile.phone || 'Not added'}</strong></div>

            <h2 className="address-title">Saved Address</h2>
            <form className="address-form" onSubmit={saveAddress}>
              <input name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Full name" required />
              <input name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Phone number" required />
              <input name="addressLine" value={address.addressLine} onChange={handleAddressChange} placeholder="House / street / landmark" required />
              <input name="city" value={address.city} onChange={handleAddressChange} placeholder="City" required />
              <input name="state" value={address.state} onChange={handleAddressChange} placeholder="State" required />
              <input name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="Pincode" required />
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</button>
            </form>
            {message && <p className="profile-message">{message}</p>}
          </section>

          <section className="profile-card orders-card">
            <div className="orders-heading"><h2>My Orders</h2><span>{orders.length} order(s)</span></div>
            {orders.length === 0 ? (
              <div className="no-orders"><div>🛍️</div><h3>No purchases yet</h3><p>Your placed orders will appear here.</p><button type="button" onClick={() => navigate('/')}>Start Shopping</button></div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <article className="order-item" key={order._id}>
                    <div className="order-meta">
                      <div><span>Order</span><strong>#{String(order._id).slice(-8).toUpperCase()}</strong></div>
                      <div><span>Placed</span><strong>{new Date(order.createdAt).toLocaleDateString('en-IN')}</strong></div>
                      <div><span>Status</span><strong className="status-badge">{order.orderStatus}</strong></div>
                    </div>
                    <div className="order-products">
                      {order.items.map((item, index) => (
                        <div className="order-product" key={`${item.productId}-${index}`}>
                          {item.image && <img src={item.image} alt="" />}
                          <div><h3>{item.title}</h3><p>Qty: {item.quantity}</p></div>
                          <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <div><span>Payment</span><strong>{order.paymentMethod} · {order.paymentStatus}</strong></div>
                      <div><span>Delivered to</span><strong>{order.address.addressLine}, {order.address.city} {order.address.pincode}</strong></div>
                      <div className="order-total"><span>Total</span><strong>{formatPrice(order.totalAmount)}</strong></div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
