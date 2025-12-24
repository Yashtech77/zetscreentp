function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: 'Rahul Sharma',
      role: 'Software Engineer',
      rating: 5,
      text: 'Best PG in Akurdi! Clean rooms, friendly staff, and great location near the station. Highly recommended for working professionals.',
      date: '2 months ago',
    },
    {
      id: 2,
      name: 'Priya Patel',
      role: 'Student',
      rating: 5,
      text: 'I have been staying here for 6 months. The rooms are spacious, WiFi is fast, and the environment is peaceful for studying.',
      date: '1 month ago',
    },
    {
      id: 3,
      name: 'Amit Kumar',
      role: 'IT Professional',
      rating: 4,
      text: 'Good value for money. The attached bathroom room is worth it. Staff is helpful and responsive to any issues.',
      date: '3 weeks ago',
    },
    {
      id: 4,
      name: 'Sneha Deshmukh',
      role: 'Working Professional',
      rating: 5,
      text: 'Safe and secure PG for girls. CCTV surveillance, proper security, and well-maintained common areas. Very happy with my stay!',
      date: '1 week ago',
    },
  ]

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
