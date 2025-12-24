function About() {
  const phoneNumber = '919175916383'

  const amenities = [
    { icon: '🛏️', title: 'Furnished Rooms', desc: 'Fully furnished with premium bedding' },
    { icon: '📶', title: 'High-Speed WiFi', desc: 'Seamless connectivity for work & leisure' },
    { icon: '🧹', title: 'Housekeeping', desc: 'Daily cleaning and maintenance' },
    { icon: '🔒', title: '24/7 Security', desc: 'CCTV surveillance and secure access' },
    { icon: '🚿', title: 'Hot Water', desc: 'Geyser facility with 24/7 hot water' },
    { icon: '🧺', title: 'Washing Machine', desc: 'Common washing machine facility' },
    { icon: '💧', title: 'RO Water', desc: 'Pure RO drinking water available' },
    { icon: '❄️', title: 'Refrigerator', desc: 'Common fridge for residents' },
    { icon: '🍳', title: 'Induction', desc: 'Induction available for cooking' },
  ]

  const stats = [
    { number: '2000+', label: 'Happy Residents' },
    { number: '5+', label: 'Years Experience' },
    { number: '24/7', label: 'Support Available' },
    { number: '100%', label: 'Satisfaction Rate' },
  ]

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in Gurbaani Living PG. Please share more details.`
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">About Us</span>
          <h2 className="section-title">A Place You'll Love to Call Home</h2>
          <p className="section-subtitle">
            Gurbaani Living offers a premium PG experience with world-class amenities,
            a welcoming community, and a peaceful environment perfect for students
            and working professionals.
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div id="amenities" className="amenities-section">
          <h3 className="amenities-title">What We Offer</h3>
          <div className="amenities-grid">
            {amenities.map((item, index) => (
              <div key={index} className="amenity-card">
                <span className="amenity-icon">{item.icon}</span>
                <h4 className="amenity-title">{item.title}</h4>
                <p className="amenity-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="contact" className="contact-section">
          <div className="contact-content">
            <h3 className="contact-title">Ready to Move In?</h3>
            <p className="contact-desc">
              Schedule a visit today and experience the Gurbaani Living difference.
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Swapanagari Society, Akurdi, Pune - 411033</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+91 91759 16383</span>
              </div>
            </div>
            <button onClick={handleWhatsApp} className="btn btn-whatsapp">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
