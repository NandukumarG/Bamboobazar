import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Loader from '../components/Loader'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ShopExperience } from '../context/ShopExperience'

function MainLayout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <ShopExperience><div className="site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="site__content">
        <Suspense fallback={<div className="page"><Loader label="Opening your next page..." /></div>}><Outlet /></Suspense>
      </main>
      <Footer />
    </div></ShopExperience>
  )
}

export default MainLayout
