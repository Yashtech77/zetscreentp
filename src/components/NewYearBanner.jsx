import { useState, useEffect } from 'react'

const NewYearBanner = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [offer, setOffer] = useState(null)

  useEffect(() => {
    fetch('/api/offers')
      .then(r => r.json())
      .then(setOffer)
      .catch(() => {})
  }, [])

  if (!isVisible) return null
  if (!offer || !offer.enabled) return null

  return (
    <div className="new-year-banner" style={offer.bgColor ? { backgroundColor: offer.bgColor } : {}}>
      <div className="new-year-sparkles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }} />
        ))}
      </div>
      <div className="new-year-content">
        <span className="new-year-icon">🎉</span>
        <div className="new-year-text">
          <span className="new-year-wish">{offer.title || 'Special Offer'}</span>
          {offer.discount && <span className="new-year-number">{offer.discount}</span>}
          <span className="new-year-offer">{offer.subtitle || 'Limited Time Offer!'}</span>
        </div>
        <span className="new-year-icon">🎊</span>
      </div>
      <button
        className="new-year-close"
        onClick={() => setIsVisible(false)}
        aria-label="Close banner"
      >
        ×
      </button>
    </div>
  )
}

export default NewYearBanner
