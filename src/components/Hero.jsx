import buildingImg from '../assets/building.jpeg'
function Hero() {
  const phoneNumber = '919175916383'

  const handleBookVisit = () => {
    const message = `Hi, I'd like to schedule a visit to Gurbaani Living PG. Please let me know the available timings.`
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const features = [
    {
      title: 'For Students',
      subtitle: 'Near colleges ',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80'
    },
    {
      title: 'For Professionals',
      subtitle: 'Close to IT hubs',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80'
    },
    {
      title: 'Safe & Secure',
      subtitle: '24/7 security & CCTV',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80'
    }
  ]

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Trusted by 2000+ Residents
          </span>

          <h1 className="hero-title">
            Find Your <span>Perfect</span> PG in Pune
          </h1>

          <p className="hero-description">
            Premium accommodation with modern amenities, homely environment,
            and a community you'll love. Starting at just ₹4,500/month.
          </p>

          <div className="hero-cta">
            <button onClick={handleBookVisit} className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Book a Visit
            </button>
            <a href="#rooms" className="btn btn-outline">
              View Rooms
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>

          <div className="hero-locations">
            <span className="hero-locations-label">Available in:</span>
            <div className="hero-location-tags">
              <span>Akurdi</span>
              <span>Wakad</span>
              <span>Pimpri-Chinchwad</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-main-image">
            <img
              src={buildingImg}
              alt="Gurbaani Living Building"
            />
          </div>

          <div className="hero-feature-cards">
            {features.map((feature, index) => (
              <div key={index} className="hero-feature-card">
                <div className="hero-feature-text">
                  <h3>{feature.title}</h3>
                  <p>{feature.subtitle}</p>
                  <span className="hero-feature-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
                <div className="hero-feature-image">
                  <img src={feature.image} alt={feature.title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
