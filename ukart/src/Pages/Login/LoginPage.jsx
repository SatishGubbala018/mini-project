import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './LoginPage.css'
import backgroundImage from '../../assets/loginPage/background.png'
import loginArt from '../../assets/loginPage/loginBg.png'
import { useAuth } from '../../context/AuthContext'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

const LoginPage = () => {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const isLogin = mode === 'login'
  const redirectPath = '/'

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      login(data.user, data.token)
      navigate(redirectPath)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page page-enter" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={`auth-shell auth-shell-${mode}`}>
        <section className="brand-panel">
          <header className="brand-header">
            <div className="brand-mark" aria-label="Ukart logo">
              <span className="bag-handle" />
              <span className="bag-body" />
            </div>
            <h1>
              Uk<span>art</span>
            </h1>
          </header>

          <div className="welcome-block">
            <h2>
              {isLogin ? (
                <>
                  Welcome <span>Back!</span>
                </>
              ) : (
                <>
                  Join <span>Ukart</span>
                </>
              )}
            </h2>
            <p>
              {isLogin ? 'Sign in to continue your shopping journey' : 'Create your account and shop smarter'}
              <span className="heart">♥</span>
            </p>
          </div>

          <img className="promo-art" src={loginArt} alt="Ukart shopping illustration" />
        </section>

        <aside className="login-panel">
          <div className="auth-switch">
            <button
              type="button"
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setMode('login')
                setError('')
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setMode('register')
                setError('')
              }}
            >
              Register
            </button>
          </div>

          <div className="form-wrap">
            <h3>
              {isLogin ? (
                <>
                  Login to <span>Ukart</span>
                </>
              ) : (
                <>
                  Create <span>Ukart</span>
                </>
              )}
            </h3>
            <p className="subtext">
              {isLogin
                ? 'Welcome back! Please login to your account'
                : 'Create your account to start your shopping journey'}
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <label className="field">
                  <span className="field-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                  />
                </label>
              )}

              <label className="field">
                <span className="field-icon">✉</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                />
              </label>

              {!isLogin && (
                <label className="field">
                  <span className="field-icon">📱</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                  />
                </label>
              )}

              <label className="field password-field">
                <span className="field-icon">◒</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isLogin ? 'Password' : 'Create Password'}
                  required
                />
                <span className="toggle-eye" aria-label="Show password">
                  ◌
                </span>
              </label>

              {!isLogin && (
                <label className="field password-field">
                  <span className="field-icon">◒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                  />
                  <span className="toggle-eye" aria-label="Show password">
                    ◌
                  </span>
                </label>
              )}

              {isLogin && (
                <div className="meta-row">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember Me</span>
                  </label>
                  <a href="#">Forgot Password?</a>
                </div>
              )}

              {error && <p className="error-text">{error}</p>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'} <span>→</span>
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <button type="button" className="google-btn">
              <span className="google-mark">G</span>
              {isLogin ? 'Continue with Google' : 'Sign up with Google'}
            </button>

            <p className="signup-copy">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" className="inline-link" onClick={() => setMode(isLogin ? 'register' : 'login')}>
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default LoginPage
