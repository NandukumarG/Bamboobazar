import { useState } from 'react'
import { Link } from 'react-router-dom'

const SOCIAL_ICONS = [
  { label: 'Instagram', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 6.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6ZM17.5 6a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z' },
  { label: 'Facebook', path: 'M13.5 21v-7.6h2.6l.4-3H13.5V8.4c0-.9.3-1.5 1.6-1.5h1.7V4.2C16.5 4.1 15.5 4 14.4 4c-2.4 0-4 1.5-4 4.1v2.3H7.8v3h2.6V21h3.1Z' },
  { label: 'Pinterest', path: 'M12 3a9 9 0 0 0-3.3 17.4c0-.7 0-1.6.2-2.4l1.3-5.6s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.6 0 1-.6 2.4-1 3.7-.2 1 .5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.1-3.8-3 0-4.8 2.2-4.8 4.6 0 .8.3 1.4.6 1.9.2.2.2.3.1.5l-.3 1c0 .2-.2.3-.4.2-1.2-.5-1.7-1.8-1.7-3.3 0-2.5 2.1-5.4 6.2-5.4 3.3 0 5.5 2.4 5.5 5 0 3.4-1.9 6-4.6 6-.9 0-1.8-.5-2.1-1.1l-.6 2.3c-.2.8-.6 1.6-1 2.2A9 9 0 1 0 12 3Z' },
  { label: 'YouTube', path: 'M21.6 7.5s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.9 4.3 12 4.3 12 4.3h0s-3.9 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9.3 2.2 11v1.9c0 1.7.2 3.5.2 3.5s.2 1.5.8 2.1c.8.8 1.9.8 2.3.9 1.7.2 7.5.2 7.5.2s3.9 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.5V11c0-1.7-.2-3.5-.2-3.5ZM9.9 14.6V8.9l5.4 2.9-5.4 2.8Z' },
]

const FOOTER_LINKS = [
  {
    heading: 'Shop',
    items: [
      { label: 'All Products', to: '/products' },
      { label: 'Collections', to: '/categories' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    heading: 'Customer Service',
    items: [
      { label: 'FAQs' },
      { label: 'Shipping & Delivery' },
      { label: 'Returns & Refunds' },
      { label: 'Track Your Order' },
    ],
  },
]

function Footer() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')

  const handleSubscribe = (event) => {
    event.preventDefault()
    setNotice('Newsletter signup is coming soon — thanks for your interest!')
    setEmail('')
  }

  return (
    <footer className="site-footer">
      <div className="newsletter">
        <div className="newsletter__inner">
          <div>
            <h2>Stay close to nature.</h2>
            <p>Be the first to know about new arrivals, exclusive offers and stories from our world of bamboo.</p>
          </div>
          <form className="newsletter__form" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address for newsletter"
              placeholder="Enter your email address"
              required
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </div>
        {notice && <p className="newsletter__notice">{notice}</p>}
      </div>

      <div className="footer__main">
        <div className="footer__brand">
          <Link to="/" className="navbar__brand">
            Bamboo<span>Store</span>
          </Link>
          <p>Crafted by nature, made for you.</p>
          <div className="footer__social">
            {SOCIAL_ICONS.map((icon) => (
              <span key={icon.label} className="footer__social-icon" title={icon.label}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d={icon.path} />
                </svg>
              </span>
            ))}
          </div>
        </div>

        {FOOTER_LINKS.map((column) => (
          <div key={column.heading} className="footer__column">
            <h3>{column.heading}</h3>
            <ul>
              {column.items.map((item) => (
                <li key={item.label}>
                  {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer__column">
          <h3>Contact Us</h3>
          <ul>
            <li>
              <span>hello@bamboostore.example</span>
            </li>
            <li>
              <span>+91 98765 43210</span>
            </li>
            <li>
              <span>Bengaluru, India</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Bamboo Store. All rights reserved.</span>
        <div className="footer__payments">
          <span>VISA</span>
          <span>MASTERCARD</span>
          <span>UPI</span>
          <span>RUPAY</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
