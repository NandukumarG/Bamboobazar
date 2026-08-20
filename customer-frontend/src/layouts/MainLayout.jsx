import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MainLayout() {
  return (
    <div className="site">
      <Navbar />
      <main className="site__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
