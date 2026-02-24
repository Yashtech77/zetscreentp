import { useState, useEffect } from 'react'
import API_BASE from '../config'

function Footer() {
  const currentYear = new Date().getFullYear()
  const [contact, setContact] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/contact`).then(r => r.json()).then(setContact).catch(() => {})
  }, [])

  const phone = contact?.phone || '+91 91759 16383'
  const email = contact?.email || 'gurbaaniliving@gmail.com'
  const address = contact?.address || 'Swapanagari Society, Akurdi, Pune - 411033'

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <span className="logo-text">Gurbaani</span>
              <span className="logo-accent">Living</span>
            </a>
            <p className="footer-tagline">
              Your comfort, our priority. Experience premium living.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#rooms">Rooms</a></li>
                <li><a href="#gallery">Gallery</a></li>
                <li><a href="#testimonials">Reviews</a></li>
                <li><a href="#location">Location</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li>{phone}</li>
                <li>{email}</li>
                <li>{address}</li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="https://www.instagram.com/gurbaani_living/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Gurbaani Living. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
