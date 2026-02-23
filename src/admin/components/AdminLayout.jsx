import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../api'

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/admin/enquiries', label: 'Enquiries', icon: '💬' },
  { path: '/admin/offers', label: 'Offers Banner', icon: '🎉' },
  { path: '/admin/locations', label: 'Locations', icon: '📍' },
  { path: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
  { path: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
  { path: '/admin/contact', label: 'Contact Info', icon: '📞' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{
        width: 240,
        background: '#1e293b',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Gurbaani Living</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Admin Panel</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                color: isActive ? '#f1f5f9' : '#94a3b8',
                background: isActive ? '#334155' : 'transparent',
                textDecoration: 'none',
                fontSize: 14,
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #334155' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: 240, flex: 1, background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ padding: 32 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
