import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import logo from '../assets/logo.png'

function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [location.pathname, location.search])
  useEffect(() => {
    const close = event => { if (event.key === 'Escape') { setMenuOpen(false); setSearchOpen(false) } }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products')
    setSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <>
      <div className="announcement-bar">Free shipping on orders above ₹2,000</div>

      <header className="navbar">
        <div className="navbar__inner">
          <Link to="/" className="navbar__brand">
            <img src={logo} alt="Bamboo Bazar" className="navbar__logo" />
          </Link>

          <nav id="primary-navigation" aria-label="Main navigation" className={`navbar__links${menuOpen ? ' is-open' : ''}`}>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" onClick={() => setMenuOpen(false)}>
              Shop
            </NavLink>
            <NavLink to="/categories" onClick={() => setMenuOpen(false)}>
              Collections
            </NavLink>
            <a href="/#story" onClick={() => setMenuOpen(false)}>
              About
            </a>
          </nav>

          <form
            className={`navbar__search${searchOpen ? ' is-open' : ''}`}
            id="navigation-search"
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <input
              type="search"
              placeholder="Search bamboo products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="navbar__search-submit" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>

          <div className="navbar__actions">
            <button
              type="button"
              className="navbar__search-toggle"
              aria-label="Toggle search"
              aria-expanded={searchOpen}
              aria-controls="navigation-search"
              onClick={() => {
                setSearchOpen((open) => !open)
                setMenuOpen(false)
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>

            {isAuthenticated ? (
              <Link to="/profile" className="navbar__icon-link" title={user?.name || 'Profile'}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
                </svg>
              </Link>
            ) : (
              <Link to="/login" className="navbar__icon-link" title="Sign in">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
                </svg>
              </Link>
            )}

            <Link to="/cart" className="navbar__icon-link" title="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 7h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 7Z" />
                <path d="M8 7V6a4 4 0 0 1 8 0v1" />
              </svg>
              {itemCount > 0 && <span className="navbar__cart-badge">{itemCount}</span>}
            </Link>

            <button
              type="button"
              className="navbar__menu-toggle"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => {
                setMenuOpen((open) => !open)
                setSearchOpen(false)
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar
