import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as categoryService from '../services/category.service'
import * as productService from '../services/product.service'
import CategoryTile from '../components/CategoryTile'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import Reveal from '../components/Reveal'
import heroBg from '../assets/hero-bg.png'
import storyImage from '../assets/aboutus-1.png'
import bannerImage from '../assets/aboutus-2.png'

const FEATURES = [
  {
    title: 'Sustainably Sourced',
    description: 'Responsibly harvested from natural forests.',
    path: 'M12 2c-4 3-6 7-6 10.5A6 6 0 0 0 12 22a6 6 0 0 0 6-9.5C18 9 16 5 12 2Z',
  },
  {
    title: 'Handcrafted',
    description: 'Made with care by skilled artisans and craftspeople.',
    path: 'M12 21s-7-4.4-9.5-9C1 8.5 2.5 5 6 5c2 0 3.3 1.1 4 2 .7-.9 2-2 4-2 3.5 0 5 3.5 3.5 7-2.5 4.6-9.5 9-9.5 9Z',
  },
  {
    title: 'Built to Last',
    description: 'Strong, durable and designed to stand the test of time.',
    path: 'M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z',
  },
  {
    title: 'Naturally Beautiful',
    description: "Timeless designs inspired by nature's beauty.",
    path: 'M12 3v18M5 8c3 0 5 2 7 4M19 16c-3 0-5-2-7-4',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'The quality is exceptional and the designs are so elegant. My home feels more warm and connected to nature.',
    name: 'Asha R.',
    location: 'Bengaluru',
  },
  {
    quote: 'Beautiful craftsmanship! You can truly feel the difference in every piece. Highly recommend.',
    name: 'Rahul M.',
    location: 'Mumbai',
  },
  {
    quote: 'Sustainable, stylish and so well made. These are products you will cherish for years to come.',
    name: 'Meera S.',
    location: 'Delhi',
  },
]

function HomePage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  // Category strip and Best Sellers are the only sections backed by the API —
  // everything else below (story, features, banner, testimonials) is static
  // marketing content and must render regardless of whether the API call
  // succeeds, so a backend hiccup doesn't blank out most of the page.
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    Promise.all([categoryService.getCategories(), productService.getProducts({ limit: 20 })])
      .then(([categoryData, productData]) => {
        setCategories(categoryData)
        setProducts(productData)
      })
      .catch(() => setDataError('Failed to load categories and products right now.'))
      .finally(() => setDataLoading(false))
  }, [])

  const bestSellers = products.slice(0, 4)

  // Fall back to a representative product photo only when the category has
  // no image of its own set in the admin panel.
  const fallbackCategoryImages = {}
  products.forEach((product) => {
    if (product.category_slug && !fallbackCategoryImages[product.category_slug]) {
      fallbackCategoryImages[product.category_slug] = product.image_url
    }
  })

  const handleHeroMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHeroTilt({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    })
  }

  const handleHeroMouseLeave = () => setHeroTilt({ x: 0, y: 0 })

  return (
    <div>
      <section className="hero" onMouseMove={handleHeroMouseMove} onMouseLeave={handleHeroMouseLeave}>
        <div
          className="hero__content"
          style={{ transform: `perspective(1200px) rotateX(${heroTilt.y * -3}deg) rotateY(${heroTilt.x * 3}deg)` }}
        >
          <div
            className="hero__leaf"
            aria-hidden="true"
            style={{ transform: `translate3d(${heroTilt.x * 12}px, ${heroTilt.y * 12}px, 0)` }}
          >
            <svg viewBox="0 0 120 120" fill="none">
              <path d="M60 8C82 30 92 58 60 112C28 58 38 30 60 8Z" fill="#6B7A3D" fillOpacity="0.18" />
            </svg>
          </div>
          <h1>
            Crafted
            <br />
            by Nature.
          </h1>
          <p>Thoughtfully designed bamboo products for beautiful, conscious living.</p>
          <div className="hero__actions">
            <Link to="/products" className="btn btn-primary">
              Shop Collection
            </Link>
            <a href="#story" className="btn btn-ghost">
              Explore Our Story
            </a>
          </div>
        </div>

        <div className="hero__media">
          <div
            className="hero__media-img"
            role="img"
            aria-label="Bamboo vase and console table styled with natural light"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
        </div>
      </section>

      <section className="section">
        {dataLoading ? (
          <Loader label="Loading categories…" />
        ) : dataError ? (
          <div className="alert alert-error">{dataError}</div>
        ) : (
          <div className="category-strip">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={index * 60}>
                <CategoryTile
                  category={category}
                  imageUrl={category.image_url || fallbackCategoryImages[category.slug]}
                  index={index}
                />
              </Reveal>
            ))}
            {categories.length === 0 && <p>No categories available yet.</p>}
          </div>
        )}
      </section>

      <section className="section">
        <Reveal className="section-heading" as="div">
          <h2>Best Sellers</h2>
        </Reveal>
        {dataLoading ? (
          <Loader label="Loading products…" />
        ) : dataError ? (
          <div className="alert alert-error">{dataError}</div>
        ) : (
          <div className="product-grid">
            {bestSellers.map((product, index) => (
              <Reveal key={product.id} delay={index * 80}>
                <ProductCard product={product} showAddToCart />
              </Reveal>
            ))}
            {bestSellers.length === 0 && <p>No products available yet.</p>}
          </div>
        )}
      </section>

      <Reveal as="section" id="story" className="story">
        <div className="story__panel">
          <div
            className="story__panel-img"
            role="img"
            aria-label="Sunlit bamboo stalks with fresh leaves"
            style={{ backgroundImage: `url(${storyImage})` }}
          />
        </div>
        <div className="story__content">
          <h2>From Bamboo to Belonging</h2>
          <p>
            Every piece we create is a celebration of nature, tradition and craftsmanship.
            Sustainably sourced bamboo meets the hands of skilled artisans to bring you products
            that are beautiful, durable and kinder to our planet.
          </p>
          <Link to="/products" className="btn btn-dark">
            Shop the collection
          </Link>
        </div>
      </Reveal>

      <section className="features">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 80}>
            <div className="feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d={feature.path} />
              </svg>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="section">
        <Reveal>
          <div className="banner">
            <div className="banner__content">
              <h2>Bring Nature Home</h2>
              <p>Discover our curated collection of timeless bamboo pieces for every corner of your home.</p>
              <Link to="/products" className="btn btn-primary">
                Shop the Collection
              </Link>
            </div>
            <div className="banner__panel">
              <img src={bannerImage} alt="Rattan pendant light over a bamboo console table" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal className="section-heading" as="div">
          <h2>What Our Customers Say</h2>
        </Reveal>
        <div className="testimonials">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 100}>
              <div className="testimonial">
                <div className="testimonial__stars">★★★★★</div>
                <p>&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="testimonial__author">
                  <span className="testimonial__avatar">{testimonial.name.charAt(0)}</span>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.location}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <Reveal>
          <div className="contact-card">
            <div className="contact-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M21 5.5v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-13m18 0a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1m18 0-9 7-9-7" />
              </svg>
            </div>
            <div className="contact-card__content">
              <h2>Contact Us</h2>
              <p>Have a question about an order or our products? We&apos;d love to hear from you.</p>
              <div className="contact-card__details">
                <a href="tel:+919876543210" className="contact-card__item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
                  </svg>
                  <span>+91 98765 43210</span>
                </a>
add                <a href="mailto:hello@bamboostore.example" className="contact-card__item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <path d="M21 5.5v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-13m18 0a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1m18 0-9 7-9-7" />
                  </svg>
                  <span>hello@bamboostore.example</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

export default HomePage
