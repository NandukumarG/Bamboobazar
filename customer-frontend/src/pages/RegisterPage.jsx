import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authService from '../services/auth.service'
import signUpImage from '../assets/sign-up.png'
import logo from '../assets/logo.png'

const emptyForm = { name: '', email: '', phone: '', password: '' }

function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setErrors([])

    if (form.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms & Privacy Policy to continue.')
      return
    }

    setSubmitting(true)
    try {
      const data = await authService.register(form)
      login(data.user, data.token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
      setErrors(err.response?.data?.errors || [])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-split">
      <div
        className="auth-split__media"
        role="img"
        aria-label="An artisan hand-weaving a bamboo basket"
        style={{ backgroundImage: `url(${signUpImage})` }}
      />

      <div className="auth-split__panel">
        <div className="auth-split__content">
          <img src={logo} alt="Bamboo Bazar" className="auth-split__logo" />

          <h1>Create Your Account</h1>
          <p className="auth-split__subtitle">Join us in bringing nature into everyday living.</p>

          {error && (
            <div className="alert alert-error">
              {error}
              {errors.length > 0 && (
                <ul>
                  {errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Full Name</span>
              <div className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
                </svg>
                <input
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>Email Address</span>
              <div className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M21 5.5v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-13m18 0a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1m18 0-9 7-9-7" />
                </svg>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>Phone Number</span>
              <div className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
                </svg>
                <input
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="Enter your phone number"
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
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Create a password"
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

            <label className="field">
              <span>Confirm Password</span>
              <div className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="input-icon__toggle"
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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

            <label className="auth-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the Terms &amp; Privacy Policy</span>
            </label>

            <button type="submit" className="btn btn-primary auth-split__submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create Account'}
              {!submitting && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
