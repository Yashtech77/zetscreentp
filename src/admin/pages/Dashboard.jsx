import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState({ rooms: 0, gallery: 0, testimonials: 0, offerEnabled: false })

  useEffect(() => {
    Promise.all([
      fetch('/api/rooms').then(r => r.json()),
      fetch('/api/gallery').then(r => r.json()),
      fetch('/api/testimonials').then(r => r.json()),
      fetch('/api/offers').then(r => r.json()),
    ]).then(([rooms, gallery, testimonials, offers]) => {
      setStats({
        rooms: rooms.length,
        gallery: gallery.length,
        testimonials: testimonials.length,
        offerEnabled: offers.enabled,
      })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Rooms', value: stats.rooms, link: '/admin/rooms', icon: '🛏️', color: '#6366f1' },
    { label: 'Gallery Images', value: stats.gallery, link: '/admin/gallery', icon: '🖼️', color: '#0ea5e9' },
    { label: 'Testimonials', value: stats.testimonials, link: '/admin/testimonials', icon: '⭐', color: '#f59e0b' },
    { label: 'Banner', value: stats.offerEnabled ? 'Active' : 'Disabled', link: '/admin/offers', icon: '🎉', color: stats.offerEnabled ? '#10b981' : '#6b7280' },
  ]

  const quickLinks = [
    { path: '/admin/offers', label: 'Manage Offers Banner', icon: '🎉' },
    { path: '/admin/rooms', label: 'Edit Rooms & Pricing', icon: '🛏️' },
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
