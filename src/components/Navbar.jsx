import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigate = useNavigate()
  const closeMenu = () => setIsMenuOpen(false)

  const goHome = () => {
    closeMenu()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="/" onClick={(e) => { e.preventDefault(); goHome() }} className="logo">
          <span className="logo-text">Gurbaani</span>
          <span className="logo-accent">Living</span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
        </button>

        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><a href="/" onClick={(e) => { e.preventDefault(); goHome() }}>Home</a></li>
          <li><a href="#location" onClick={closeMenu}>Locations</a></li>
          <li><a href="#gallery" onClick={closeMenu}>Gallery</a></li>
          <li><a href="#testimonials" onClick={closeMenu}>Reviews</a></li>
          <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
