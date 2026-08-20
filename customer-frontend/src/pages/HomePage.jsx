import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as categoryService from '../services/category.service'
import * as productService from '../services/product.service'
import CategoryTile from '../components/CategoryTile'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import Reveal from '../components/Reveal'

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

  // Categories have no image of their own — borrow the first listed product
  // photo found for each one so the tiles aren't just flat color.
  const categoryImages = {}
  products.forEach((product) => {
    if (product.category_slug && !categoryImages[product.category_slug]) {
      categoryImages[product.category_slug] = product.image_url
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
          className="hero__layer hero__layer--back"
          aria-hidden="true"
          style={{ transform: `translate3d(${heroTilt.x * -16}px, ${heroTilt.y * -16}px, 0)` }}
        >
          <svg viewBox="0 0 200 400" fill="none">
            <g stroke="#F7F3E8" strokeOpacity="0.22" strokeWidth="3">
              <line x1="30" y1="0" x2="30" y2="400" />
              <line x1="30" y1="70" x2="46" y2="70" />
              <line x1="30" y1="170" x2="46" y2="170" />
              <line x1="30" y1="270" x2="46" y2="270" />
              <line x1="90" y1="40" x2="90" y2="400" />
              <line x1="90" y1="120" x2="106" y2="120" />
              <line x1="90" y1="220" x2="106" y2="220" />
              <line x1="90" y1="320" x2="106" y2="320" />
              <line x1="150" y1="0" x2="150" y2="400" />
              <line x1="150" y1="90" x2="166" y2="90" />
              <line x1="150" y1="190" x2="166" y2="190" />
              <line x1="150" y1="290" x2="166" y2="290" />
            </g>
          </svg>
        </div>

        <div
          className="hero__layer hero__layer--front hero__layer--leaf1"
          aria-hidden="true"
          style={{ transform: `translate3d(${heroTilt.x * 24}px, ${heroTilt.y * 24}px, 0)` }}
        >
          <svg viewBox="0 0 120 120" fill="none">
            <path d="M60 8C82 30 92 58 60 112C28 58 38 30 60 8Z" fill="#C9A227" fillOpacity="0.4" />
          </svg>
        </div>

        <div
          className="hero__layer hero__layer--front hero__layer--leaf2"
          aria-hidden="true"
          style={{ transform: `translate3d(${heroTilt.x * 32}px, ${heroTilt.y * 32}px, 0)` }}
        >
          <svg viewBox="0 0 120 120" fill="none">
            <path d="M60 8C82 30 92 58 60 112C28 58 38 30 60 8Z" fill="#F7F3E8" fillOpacity="0.3" />
          </svg>
        </div>

        <div
          className="hero__content"
          style={{ transform: `perspective(1200px) rotateX(${heroTilt.y * -3}deg) rotateY(${heroTilt.x * 3}deg)` }}
        >
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
            <a href="#story" className="btn btn-outline-light">
              Explore Our Story
            </a>
          </div>
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
                <CategoryTile category={category} imageUrl={categoryImages[category.slug]} index={index} />
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
        <div className="story__panel" aria-hidden="true" />
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
            <div className="banner__panel" aria-hidden="true" />
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
    </div>
  )
}

export default HomePage
