import { useState } from 'react'

const NewYearBanner = () => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="new-year-banner">
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
          <span className="new-year-wish">Happy New Year</span>
          <span className="new-year-number">2026</span>
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