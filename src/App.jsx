import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import NewYearBanner from './components/NewYearBanner'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Instagram from './components/Instagram'
import About from './components/About'
import Testimonials from './components/Testimonials'
import Location from './components/Location'
import BuildingDetail from './components/BuildingDetail'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import Login from './admin/pages/Login'
import Dashboard from './admin/pages/Dashboard'
import EnquiriesAdmin from './admin/pages/Enquiries'
import OffersAdmin from './admin/pages/Offers'
import GalleryAdmin from './admin/pages/Gallery'
import TestimonialsAdmin from './admin/pages/Testimonials'
import ContactAdmin from './admin/pages/Contact'
import LocationsAdmin from './admin/pages/Locations'
import HeroImagesAdmin from './admin/pages/HeroImages'
import AdminLayout from './admin/components/AdminLayout'
import ProtectedRoute from './admin/components/ProtectedRoute'
import './App.css'

function MainSite() {
  return (
    <div className="app">
      <Navbar />
      <NewYearBanner />
      <main>
        <Hero />
        <Location />
        <Instagram />
        <Gallery />
        <About />
        <Testimonials />
       
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainSite />} />
      <Route path="/pg/:locationSlug/:buildingId" element={<BuildingDetail />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="enquiries" element={<EnquiriesAdmin />} />
                <Route path="offers" element={<OffersAdmin />} />
                <Route path="gallery" element={<GalleryAdmin />} />
                <Route path="testimonials" element={<TestimonialsAdmin />} />
                <Route path="contact" element={<ContactAdmin />} />
                <Route path="locations" element={<LocationsAdmin />} />
                <Route path="hero-images" element={<HeroImagesAdmin />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
