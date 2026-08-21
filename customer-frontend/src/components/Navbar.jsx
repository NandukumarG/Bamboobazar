import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
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
            Bamboo<span>Store</span>
          </Link>

          <nav className={`navbar__links${menuOpen ? ' is-open' : ''}`}>
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
              <div className="navbar__user">
                <span className="navbar__icon-link" title={user?.name}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
                  </svg>
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
                  Logout
                </button>
              </div>
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
