import { useState, useEffect } from 'react'
import API_BASE from '../config'

function Testimonials() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`).then(r => r.json()).then(setReviews).catch(() => {})
  }, [])

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={index < rating ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={index < rating ? 'star-filled' : 'star-empty'}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ))
  }

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Our Residents Say</h2>
          <p className="section-subtitle">
            Don't just take our word for it. Here's what our happy residents have to say about their experience at Gurbaani Living.
          </p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((review) => (
            <div key={review.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {review.name.charAt(0)}
                </div>
                <div className="testimonial-info">
                  <h4 className="testimonial-name">{review.name}</h4>
                  <p className="testimonial-role">{review.role}</p>
                </div>
              </div>
              <div className="testimonial-rating">
                {renderStars(review.rating)}
              </div>
              <p className="testimonial-text">"{review.text}"</p>
              <span className="testimonial-date">{review.date}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
