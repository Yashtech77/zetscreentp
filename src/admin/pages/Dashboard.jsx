import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE from '../../config'

export default function Dashboard() {
  const [stats, setStats] = useState({ locations: 0, gallery: 0, testimonials: 0, enquiries: 0, offerEnabled: false })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const authHeaders = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_BASE}/api/locations`).then(r => r.json()),
      fetch(`${API_BASE}/api/gallery`).then(r => r.json()),
      fetch(`${API_BASE}/api/testimonials`).then(r => r.json()),
      fetch(`${API_BASE}/api/offers`).then(r => r.json()),
      fetch(`${API_BASE}/api/enquiries`, { headers: authHeaders }).then(r => r.json()),
    ]).then(([locations, gallery, testimonials, offers, enquiries]) => {
      setStats({
        locations: Array.isArray(locations) ? locations.length : 0,
        gallery: Array.isArray(gallery) ? gallery.length : 0,
        testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
        enquiries: Array.isArray(enquiries) ? enquiries.length : 0,
        offerEnabled: offers?.enabled || false,
      })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Locations', value: stats.locations, link: '/admin/locations', icon: '📍', color: '#6366f1' },
    { label: 'Enquiries', value: stats.enquiries, link: '/admin/enquiries', icon: '💬', color: '#8b5cf6' },
    { label: 'Gallery Images', value: stats.gallery, link: '/admin/gallery', icon: '🖼️', color: '#0ea5e9' },
    { label: 'Testimonials', value: stats.testimonials, link: '/admin/testimonials', icon: '⭐', color: '#f59e0b' },
    { label: 'Banner', value: stats.offerEnabled ? 'Active' : 'Disabled', link: '/admin/offers', icon: '🎉', color: stats.offerEnabled ? '#10b981' : '#6b7280' },
  ]

  const quickLinks = [
    { path: '/admin/locations', label: 'Manage Locations & Rooms', icon: '📍' },
    { path: '/admin/enquiries', label: 'View Enquiries', icon: '💬' },
    { path: '/admin/offers', label: 'Manage Offers Banner', icon: '🎉' },
    { path: '/admin/gallery', label: 'Upload Gallery Images', icon: '🖼️' },
    { path: '/admin/testimonials', label: 'Manage Reviews', icon: '⭐' },
    { path: '/admin/contact', label: 'Update Contact Info', icon: '📞' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Welcome back! Here's an overview of your content.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {cards.map(card => (
          <Link key={card.link} to={card.link} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderTop: `3px solid ${card.color}`,
              transition: 'box-shadow 0.15s',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {quickLinks.map(link => (
          <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              color: '#374151',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background 0.15s',
            }}>
              <span style={{ fontSize: 20 }}>{link.icon}</span>
              {link.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
