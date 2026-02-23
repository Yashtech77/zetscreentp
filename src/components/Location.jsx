import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../config'
import EnquiryModal from './EnquiryModal'

const TYPE_CONFIG = {
  boys:     { label: 'Boys PG',   color: '#2563eb', gradient: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)' },
  girls:    { label: 'Girls PG',  color: '#be185d', gradient: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)' },
  coliving: { label: 'Co-living', color: '#6d28d9', gradient: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)' },
}

const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

function BuildingCard({ building, phoneNumber, locationSlug, locationName, offer }) {
  const navigate = useNavigate()
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const type = TYPE_CONFIG[building.type] || TYPE_CONFIG.boys
  const photos = building.photos || []
  const hasPhoto = photos.length > 0
  const discountPct = offer?.discountPercent || 0
  const discountedPrice = discountPct > 0 ? Math.round(building.price * (1 - discountPct / 100)) : null

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    setShowModal(true)
  }

  const visibleAmenities = (building.amenities || []).slice(0, 4)
  const extraCount = (building.amenities || []).length - 4

  return (
    <div className="bcard" onClick={() => navigate(`/pg/${locationSlug}/${building.id}`)}>

      {/* ── Header: photo or gradient ── */}
      <div
        className="bcard-header"
        style={!hasPhoto ? { background: type.gradient } : {}}
      >
        {hasPhoto ? (
          <>
            <img
              src={`${API_BASE}${photos[photoIdx]}`}
              alt={building.name}
              className="bcard-photo"
            />
            <div className="bcard-photo-overlay" />
            {photos.length > 1 && (
              <div className="bcard-photo-nav">
                <button
                  className="bcard-nav-btn"
                  onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + photos.length) % photos.length) }}
                >&#8249;</button>
                <div className="bcard-dots">
                  {photos.map((_, i) => (
                    <span
                      key={i}
                      className={`bcard-dot${i === photoIdx ? ' active' : ''}`}
                      onClick={e => { e.stopPropagation(); setPhotoIdx(i) }}
                    />
                  ))}
                </div>
                <button
                  className="bcard-nav-btn"
                  onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % photos.length) }}
                >&#8250;</button>
              </div>
            )}
          </>
        ) : (
          <div className="bcard-no-photo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        )}

        {/* Type badge + name always on header */}
        <div className="bcard-header-content">
          <span className="bcard-type-badge">{type.label}</span>
          <h3 className="bcard-header-name">{building.name}</h3>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bcard-body">
        {discountedPrice ? (
          <div className="bcard-price-block">
            <span className="bcard-price-original">₹{building.price.toLocaleString('en-IN')}</span>
            <div className="bcard-price">
              ₹{discountedPrice.toLocaleString('en-IN')}
              <span className="bcard-price-sub">/month</span>
              <span className="bcard-offer-pill">-{discountPct}% OFF</span>
            </div>
          </div>
        ) : (
          <div className="bcard-price">
            ₹{building.price.toLocaleString('en-IN')}
            <span className="bcard-price-sub">/month</span>
          </div>
        )}

        {building.description && (
          <p className="bcard-desc">{building.description}</p>
        )}

        {visibleAmenities.length > 0 && (
          <div className="bcard-amenities">
            {visibleAmenities.map((a, i) => (
              <span key={i} className="amenity-chip">{a}</span>
            ))}
            {extraCount > 0 && (
              <span className="amenity-chip amenity-more">+{extraCount} more</span>
            )}
          </div>
        )}

        <div className="bcard-actions">
          <button
            className="bcard-btn-details"
            onClick={e => { e.stopPropagation(); navigate(`/pg/${locationSlug}/${building.id}`) }}
          >
            View Rooms & Pricing
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button className="bcard-btn-wa" onClick={handleWhatsApp}>
            <WaIcon />
            Enquire
          </button>
        </div>
      </div>
      {showModal && (
        <EnquiryModal
          onClose={() => setShowModal(false)}
          phoneNumber={phoneNumber}
          locationName={locationName}
          buildingName={building.name}
        />
      )}
    </div>
  )
}

function Location() {
  const [locations, setLocations] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [contact, setContact] = useState(null)
  const [activeOffer, setActiveOffer] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/locations`).then(r => r.json()).then(setLocations).catch(() => {})
    fetch(`${API_BASE}/api/contact`).then(r => r.json()).then(setContact).catch(() => {})
    fetch(`${API_BASE}/api/offers`).then(r => r.json()).then(offer => {
      if (offer?.enabled && offer?.discountPercent > 0) {
        const isValid = !offer.validUntil || new Date(offer.validUntil) >= new Date()
        setActiveOffer(isValid ? offer : null)
      }
    }).catch(() => {})
  }, [])

  const phoneNumber = contact?.whatsapp || '919175916383'
  const phone = contact?.phone || '+91 91759 16383'
  const hours = contact?.hours || 'Mon - Sun: 9:00 AM - 8:00 PM'
  const active = locations[activeIdx]
  const [showModal, setShowModal] = useState(false)

  return (
    <section id="location" className="location">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Now Near You</span>
          <h2 className="section-title">Pick Your Neighbourhood</h2>
          <p className="section-subtitle">
            Whether you're starting a new job or a new chapter — we've got a home waiting for you across Pune.
          </p>
        </div>

        {locations.length > 0 && (
          <>
            <div className="location-tabs">
              {locations.map((loc, i) => (
                <button
                  key={loc.id}
                  className={`location-tab${i === activeIdx ? ' active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                >
                  {loc.name}
                  {loc.buildings.length > 0 && (
                    <span className="location-tab-count">{loc.buildings.length}</span>
                  )}
                </button>
              ))}
            </div>

            {active && (
              <div>
                {active.buildings.length > 0 ? (
                  <div className="buildings-grid">
                    {active.buildings.map(b => (
                      <BuildingCard
                        key={b.id}
                        building={b}
                        phoneNumber={phoneNumber}
                        locationSlug={active.slug}
                        locationName={active.name}
                        offer={activeOffer}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="buildings-empty">
                    <p>More details coming soon for {active.name}. Enquire directly!</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-whatsapp" style={{ marginTop: 16, display: 'inline-flex' }}>
                      <WaIcon /> Enquire on WhatsApp
                    </button>
                  </div>
                )}

                {/* Map + contact */}
                <div className="loc-map-section">
                  <div className="loc-map-wrap">
                    {active.mapEmbed ? (
                      <iframe
                        src={active.mapEmbed}
                        width="100%"
                        height="100%"
                        style={{ border: 0, display: 'block' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map - ${active.name}`}
                      />
                    ) : (
                      <div className="map-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p>Map coming soon for {active.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="loc-contact-panel">
                    <p className="loc-contact-heading">Contact & Visit</p>

                    <div className="loc-contact-item">
                      <div className="loc-contact-icon loc-icon-phone">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 12 19.79 19.79 0 0 1 1.12 3.37 2 2 0 0 1 3.1 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </div>
                      <div>
                        <span className="loc-contact-label">Call Us</span>
                        <a href={`tel:${phone}`} className="loc-contact-value">{phone}</a>
                      </div>
                    </div>

                    <div className="loc-contact-item">
                      <div className="loc-contact-icon loc-icon-clock">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </div>
                      <div>
                        <span className="loc-contact-label">Visiting Hours</span>
                        <span className="loc-contact-value">{hours}</span>
                      </div>
                    </div>

                    <div className="loc-contact-item">
                      <div className="loc-contact-icon loc-icon-pin">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div>
                        <span className="loc-contact-label">Area</span>
                        <span className="loc-contact-value">{active.name}, Pune</span>
                      </div>
                    </div>

                    <button onClick={() => setShowModal(true)} className="loc-enquire-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Book a Visit on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showModal && (
        <EnquiryModal
          onClose={() => setShowModal(false)}
          phoneNumber={phoneNumber}
          locationName={active?.name}
        />
      )}
    </section>
  )
}

export default Location
