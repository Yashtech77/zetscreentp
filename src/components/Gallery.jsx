import buildingImg from '../assets/building.jpeg'
import bedroomImg from '../assets/3bedroom.jpeg'
import balconyImg from '../assets/balcony.jpeg'
import bedroomImg2 from '../assets/2bedroom.jpeg'
import liftImg from '../assets/lift.jpeg'
import bedwashroomImg from '../assets/2bedwithbath.jpeg'

function Gallery() {
  const images = [
    {
      id: 1,
      category: 'exterior',
      title: 'Building View',
      image: buildingImg,
      featured: true
    },
    {
      id: 2,
      category: 'room',
      title: '3 Bed Room',
      image: bedroomImg,
      featured: true
    },
    {
      id: 3,
      category: 'room',
      title: '2 Bed Room',
      image: bedroomImg2,
      featured: true
    },

    {
      id: 4,
      category: 'room',
      title: 'Bed Room with Washroom',
      image: bedwashroomImg,
      featured: true
    },
    {
      id: 5,
      category: 'room',
      title: ' Lift Facility',
      image: liftImg,
      featured: true
    },
    {
      id: 6,
      category: 'room',
      title: 'Balcony View',
      image: balconyImg,
      featured: true
    },

  ]

  return (
    <section id="gallery" className="gallery">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Gallery</span>
          <h2 className="section-title">Take a Look Inside</h2>
          <p className="section-subtitle">
            Explore our well-maintained rooms, clean washrooms, and comfortable living spaces.
          </p>
        </div>

        <div className="gallery-grid">
          {images.map((item) => (
            <div key={item.id} className="gallery-item">
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="gallery-overlay">
                <span className="gallery-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery
