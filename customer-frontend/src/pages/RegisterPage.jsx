import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authService from '../services/auth.service'

const emptyForm = { name: '', email: '', phone: '', password: '' }

function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
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
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create an account</h1>

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

        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={handleChange('name')} required />
        </label>

        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={handleChange('email')} required />
        </label>

        <label className="field">
          <span>Phone</span>
          <input value={form.phone} onChange={handleChange('phone')} required />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
