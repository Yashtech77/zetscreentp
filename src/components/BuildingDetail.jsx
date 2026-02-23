import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API_BASE from '../config'
import Navbar from './Navbar'
import Footer from './Footer'
import FloatingWhatsApp from './FloatingWhatsApp'
import EnquiryModal from './EnquiryModal'

const TYPE_CONFIG = {
  boys:     { label: 'Boys PG',   color: '#3b82f6', bg: '#eff6ff' },
  girls:    { label: 'Girls PG',  color: '#ec4899', bg: '#fdf2f8' },
  coliving: { label: 'Co-living', color: '#8b5cf6', bg: '#f5f3ff' },
}

const OCCUPANCY_CONFIG = {
  double_attached: { label: 'Double (Attached Bathroom)', icon: '🛁' },
  double_sharing:  { label: 'Double Sharing',             icon: '🛏️' },
  triple_sharing:  { label: 'Triple Sharing',             icon: '🛏️' },
}

function PhotoGallery({ photos, alt }) {
  const [idx, setIdx] = useState(0)
  if (!photos || photos.length === 0) {
    return (
      <div className="detail-gallery-placeholder">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        <p>No photos yet</p>
      </div>
    )
  }
  return (
    <div className="detail-gallery">
      <img src={`${API_BASE}${photos[idx]}`} alt={alt} className="detail-gallery-main" />
      {photos.length > 1 && (
        <>
          <button className="detail-gallery-prev" onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)}>&#8249;</button>
          <button className="detail-gallery-next" onClick={() => setIdx(i => (i + 1) % photos.length)}>&#8250;</button>
          <div className="detail-gallery-thumbs">
            {photos.map((p, i) => (
              <img
                key={i}
                src={`${API_BASE}${p}`}
                alt=""
                className={`detail-gallery-thumb${i === idx ? ' active' : ''}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function RoomCard({ room, phoneNumber, buildingName, locationName, offer }) {
  const occ = OCCUPANCY_CONFIG[room.occupancy] || OCCUPANCY_CONFIG.double_sharing
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const photos = room.photos || []

  const discountPct = offer?.discountPercent || 0
  const discountedPrice = discountPct > 0 ? Math.round(room.price * (1 - discountPct / 100)) : null

  return (
    <div className="room-type-card">
      <div className="room-type-photo-wrap">
        {photos.length > 0 ? (
          <>
            <img src={`${API_BASE}${photos[photoIdx]}`} alt={room.name} className="room-type-photo" />
            {photos.length > 1 && (
              <div className="building-photo-nav">
                <button className="photo-nav-btn" onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}>&#8249;</button>
                <span className="photo-dots">
                  {photos.map((_, i) => <span key={i} className={`photo-dot${i === photoIdx ? ' active' : ''}`} onClick={() => setPhotoIdx(i)} />)}
                </span>
                <button className="photo-nav-btn" onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}>&#8250;</button>
              </div>
            )}
          </>
        ) : (
          <div className="room-type-photo-placeholder">
            <span style={{ fontSize: 28 }}>{occ.icon}</span>
          </div>
        )}
        <span className="room-occupancy-badge">{occ.label}</span>
        {discountedPrice && (
          <span className="room-offer-badge">-{discountPct}% OFF</span>
        )}
      </div>

      <div className="room-type-info">
        <h3 className="room-type-name">{room.name}</h3>

        {discountedPrice ? (
          <div className="room-price-block">
            <span className="room-price-original">₹{room.price.toLocaleString('en-IN')}</span>
            <div className="room-type-price">
              ₹{discountedPrice.toLocaleString('en-IN')}
              <span className="room-type-price-sub">/month per person</span>
            </div>
            <div className="room-offer-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              {offer.title}
            </div>
          </div>
        ) : (
          <div className="room-type-price">
            ₹{room.price.toLocaleString('en-IN')}
            <span className="room-type-price-sub">/month per person</span>
          </div>
        )}

        {room.description && <p className="room-type-desc">{room.description}</p>}
        {room.amenities && room.amenities.length > 0 && (
          <div className="room-type-amenities">
            {room.amenities.map((a, i) => (
              <span key={i} className="amenity-chip">{a}</span>
            ))}
          </div>
        )}
        <button onClick={() => setShowModal(true)} className="btn btn-whatsapp room-enquire-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enquire Now
        </button>
      </div>
      {showModal && (
        <EnquiryModal
          onClose={() => setShowModal(false)}
          phoneNumber={phoneNumber}
          locationName={locationName}
          buildingName={buildingName}
          roomName={room.name}
        />
      )}
    </div>
  )
}

export default function BuildingDetail() {
  const { locationSlug, buildingId } = useParams()
  const navigate = useNavigate()
  const [location, setLocation] = useState(null)
  const [building, setBuilding] = useState(null)
  const [contact, setContact] = useState(null)
  const [activeOffer, setActiveOffer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/locations`).then(r => r.json()),
      fetch(`${API_BASE}/api/contact`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/api/offers`).then(r => r.json()).catch(() => null),
    ]).then(([locations, contactData, offerData]) => {
      const loc = locations.find(l => l.slug === locationSlug)
      const bld = loc?.buildings?.find(b => b.id === parseInt(buildingId))
      setLocation(loc || null)
      setBuilding(bld || null)
      setContact(contactData)
      if (offerData?.enabled && offerData?.discountPercent > 0) {
        const isValid = !offerData.validUntil || new Date(offerData.validUntil) >= new Date()
        setActiveOffer(isValid ? offerData : null)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [locationSlug, buildingId])

  const phoneNumber = contact?.whatsapp || '919175916383'
  const type = building ? (TYPE_CONFIG[building.type] || TYPE_CONFIG.boys) : null
  const enabledRooms = (building?.roomTypes || []).filter(r => r.enabled)

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#94a3b8' }}>Loading...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!building) {
    return (
      <div className="app">
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Building not found.</p>
          <button onClick={() => navigate('/#location')} className="btn btn-primary">Back to Locations</button>
        </div>
        <Footer />
      </div>
    )
  }

  const handleMainEnquire = () => setShowModal(true)

  return (
    <div className="app">
      <Navbar />
      <div className="building-detail-page">
        <div className="container">

          {/* Back */}
          <button className="detail-back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to {location?.name || 'Locations'}
          </button>

          {/* Hero section */}
          <div className="detail-hero">
            <div className="detail-hero-gallery">
              <PhotoGallery photos={building.photos} alt={building.name} />
            </div>

            <div className="detail-hero-info">
              <span className="building-type-badge-lg" style={{ background: type.bg, color: type.color }}>
                {type.label}
              </span>
              <h1 className="detail-building-name">{building.name}</h1>

              <div className="detail-meta-row">
                <span className="detail-location-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {location?.name}
                </span>
                <span className="detail-price-from">
                  from ₹{building.price.toLocaleString('en-IN')}/month
                </span>
              </div>

              {building.address && (
                <p className="detail-address">{building.address}</p>
              )}

              {building.description && (
                <p className="detail-description">{building.description}</p>
              )}

              {building.amenities && building.amenities.length > 0 && (
                <div>
                  <p className="detail-section-label">Amenities</p>
                  <div className="building-amenities">
                    {building.amenities.map((a, i) => (
                      <span key={i} className="amenity-chip">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleMainEnquire} className="btn btn-whatsapp detail-main-wa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enquire on WhatsApp
              </button>
            </div>
          </div>

          {/* Room Types */}
          <div className="detail-rooms-section">
            <div className="detail-rooms-header">
              <h2 className="detail-rooms-title">Room Options & Pricing</h2>
              {enabledRooms.length > 0 && (
                <p className="detail-rooms-sub">Choose the room type that suits you best</p>
              )}
            </div>

            {enabledRooms.length > 0 ? (
              <div className="room-types-grid">
                {enabledRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    phoneNumber={phoneNumber}
                    buildingName={building.name}
                    locationName={location?.name}
                    offer={activeOffer}
                  />
                ))}
              </div>
            ) : (
              <div className="rooms-empty-state">
                <p>Room details coming soon. Contact us directly for pricing.</p>
                <button onClick={handleMainEnquire} className="btn btn-whatsapp" style={{ marginTop: 16, display: 'inline-flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Ask for Pricing
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
      <FloatingWhatsApp />
      {showModal && (
        <EnquiryModal
          onClose={() => setShowModal(false)}
          phoneNumber={phoneNumber}
          locationName={location?.name}
          buildingName={building.name}
        />
      )}
    </div>
  )
}
