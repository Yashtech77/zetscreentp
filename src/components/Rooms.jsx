import { useState } from 'react'

function Rooms() {
  const phoneNumber = '919175916383'
  const [selectedRoom, setSelectedRoom] = useState(null)

  const rooms = [
    {
      type: 'Triple Sharing',
      price: '4,500',
      period: '/month',
      features: [
        'Spacious triple sharing room',
        'Individual wardrobe space',
        'Common washroom',
        'Hot water facility',
        'High-speed WiFi',
        '24/7 security',
        'Daily housekeeping',
      ],
      popular: false,
    },
    {
      type: 'Double Sharing',
      price: '5,000',
      period: '/month',
      features: [
        'Comfortable double sharing',
        'Personal study desk',
        'Common washroom',
        'Hot water facility',
        'High-speed WiFi',
        '24/7 security',
        'Daily housekeeping',
      ],
      popular: true,
    },
    {
      type: 'Double with Attached Bath',
      price: '6,500',
      period: '/month',
      features: [
        'Double sharing room',
        'Personal study desk',
        'Private attached washroom',
        'Hot water facility',
        'High-speed WiFi',
        '24/7 security',
        'Daily housekeeping',
      ],
      popular: false,
    },
  ]

  const handleBooking = (roomType) => {
    const message = `Hi, I'm interested in booking a ${roomType} room at Gurbaani Living. Please share more details.`
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <section id="rooms" className="rooms">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Accommodation</span>
          <h2 className="section-title">Choose Your Perfect Room</h2>
          <p className="section-subtitle">
            Flexible options to suit your budget and preferences.
            All rooms come with essential amenities included.
          </p>
        </div>

        <div className="rooms-grid">
          {rooms.map((room, index) => (
            <div
              key={index}
              className={`room-card ${room.popular ? 'room-card--popular' : ''} ${selectedRoom === index ? 'room-card--selected' : ''}`}
              onClick={() => setSelectedRoom(selectedRoom === index ? null : index)}
              style={{ cursor: 'pointer' }}
            >
              {room.popular && <span className="room-badge">Most Popular</span>}
              <h3 className="room-type">{room.type}</h3>
              <div className="room-price">
                <span className="room-currency">₹</span>
                <span className="room-amount">{room.price}</span>
                <span className="room-period">{room.period}</span>
              </div>
              <ul className="room-features">
                {room.features.map((feature, i) => (
                  <li key={i}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {selectedRoom === index ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBooking(room.type)
                  }}
                  className="btn btn-primary"
                >
                  Book on WhatsApp
                </button>
              ) : (
                <button className="btn btn-secondary">
                  Select Room
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="rooms-note">
          * Security deposit of one month's rent applicable. Minimum stay: 3 months.
        </p>
      </div>
    </section>
  )
}

export default Rooms
