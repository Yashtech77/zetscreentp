function Gallery() {
  const images = [
    {
      id: 1,
      category: 'room',
      title: 'Cozy Bedroom',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'
    },
    {
      id: 2,
      category: 'room',
      title: 'Study Area',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
    },
    {
      id: 3,
      category: 'common',
      title: 'Common Area',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'
    },
    {
      id: 4,
      category: 'washroom',
      title: 'Modern Washroom',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80'
    },
    {
      id: 5,
      category: 'room',
      title: 'Twin Sharing Room',
      image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&q=80'
    },
    {
      id: 6,
      category: 'exterior',
      title: 'Building View',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80'
    },
  ]

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
              <img src={item.image} alt={item.title} loading="lazy" />
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
