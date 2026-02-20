import { useState, useEffect } from 'react'
import API_BASE from '../config'

function Gallery() {
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/gallery`).then(r => r.json()).then(setImages).catch(() => {})
  }, [])

  return (
    <section id="gallery" className="gallery">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Gallery</span>
          <h2 className="section-title">Take a Look Inside</h2>
          <p className="section-subtitle">
            Explore our well-maintained rooms, clean washrooms, and comfortable living spaces.
          </p>
        </div>

        <div className="gallery-grid">
          {images.map((item) => (
            <div key={item.id} className="gallery-item">
              <img src={item.url} alt={item.title} loading="lazy" />
              <div className="gallery-overlay">
                <span className="gallery-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery
