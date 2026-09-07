import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authService from '../services/auth.service'
import loginImage from '../assets/login.webp'
import logo from '../assets/logo.png'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const data = await authService.login(email, password)
      login(data.user, data.token)
      const redirectTo = location.state?.from || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-split">
      <div
        className="auth-split__media"
        role="img"
        aria-label="A cozy rattan armchair beside a bamboo pendant light"
        style={{ backgroundImage: `url(${loginImage})` }}
      />

      <div className="auth-split__panel">
        <div className="auth-split__content">
          <img src={logo} alt="Bamboo Bazar" className="auth-split__logo" />

          <h1>Welcome Back</h1>
          <p className="auth-split__subtitle">Continue your journey with naturally crafted living.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Email address</span>
              <div className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M21 5.5v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-13m18 0a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1m18 0-9 7-9-7" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="input-icon__toggle"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M6.5 6.7C4.3 8.2 2.7 10.3 2 12c1.6 3.8 5.4 7 10 7 1.7 0 3.3-.4 4.7-1.2M9.9 4.2A10.5 10.5 0 0 1 12 4c4.6 0 8.4 3.2 10 7-.5 1.2-1.3 2.5-2.3 3.6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M2 12c1.6-3.8 5.4-7 10-7s8.4 3.2 10 7c-1.6 3.8-5.4 7-10 7s-8.4-3.2-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <button type="submit" className="btn btn-primary auth-split__submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Login'}
              {!submitting && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
