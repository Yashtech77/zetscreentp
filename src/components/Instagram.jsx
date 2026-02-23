export default function Instagram() {
  return (
    <section className="instagram-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Life at Gurbaani</span>
          <h2 className="section-title">More Than Just a Room</h2>
          <p className="section-subtitle">
            Real people, real comfort — a glimpse into the community you'll call home.
          </p>
        </div>

        <div className="instagram-widget-wrap">
          {/* SnapWidget */}
          <iframe
            src="https://snapwidget.com/embed/1118698"
            className="snapwidget-widget"
            allowtransparency="true"
            frameBorder="0"
            scrolling="no"
            style={{ border: 'none', overflow: 'hidden', width: '100%', height: '160px' }}
            title="Posts from Instagram"
          />
        </div>

        <div className="instagram-cta">
          <a
            href="https://www.instagram.com/gurbaani_living/"
            target="_blank"
            rel="noopener noreferrer"
            className="insta-follow-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            Follow @gurbaani_living
          </a>
        </div>
      </div>
    </section>
  )
}
