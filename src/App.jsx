import Navbar from './components/Navbar'
import NewYearBanner from './components/NewYearBanner'
import Hero from './components/Hero'
import Rooms from './components/Rooms'
import Gallery from './components/Gallery'
import About from './components/About'
import Testimonials from './components/Testimonials'
import Location from './components/Location'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <NewYearBanner />
      <main>
        <Hero />
        <Rooms />
        <Gallery />
        <About />
        <Testimonials />
        <Location />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

export default App
