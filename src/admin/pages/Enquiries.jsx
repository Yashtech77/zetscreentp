import { useState, useEffect } from 'react'
import { authFetch } from '../api'

function fmt(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterLocation, setFilterLocation] = useState('All')
  const [search, setSearch] = useState('')

  const load = () => {
    authFetch('/api/enquiries')
      .then(r => r.json())
      .then(data => { setEnquiries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const downloadCSV = () => {
    const headers = ['Name', 'Mobile', 'Occupation', 'Location', 'Building', 'Room Type', 'Date']
    const rows = filtered.map(e => [
      e.name, e.mobile, e.occupation || '',
      e.locationName || '', e.buildingName || '', e.roomName || '',
      fmt(e.createdAt),
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return
    await authFetch(`/api/enquiries/${id}`, { method: 'DELETE' })
    setEnquiries(prev => prev.filter(e => e.id !== id))
  }

  const locations = ['All', ...Array.from(new Set(enquiries.map(e => e.locationName).filter(Boolean)))]

  const filtered = enquiries.filter(e => {
    const matchLoc = filterLocation === 'All' || e.locationName === filterLocation
    const q = search.toLowerCase()
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.mobile.includes(q) || (e.buildingName || '').toLowerCase().includes(q)
    return matchLoc && matchSearch
  })

  return (
    <div>
      <h1 style={h1}>Enquiries</h1>
      <p style={subtext}>All WhatsApp enquiries submitted via the website.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search name, mobile, building..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 260 }}
        />
        <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }}>
          {locations.map(l => <option key={l}>{l}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {filtered.length} enquir{filtered.length === 1 ? 'y' : 'ies'}
          </span>
          <button onClick={downloadCSV} disabled={filtered.length === 0} style={dlBtn}>
            ⬇ Download Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={emptyBox}>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>No enquiries yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(e => (
            <div key={e.id} style={card}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* Left: user info */}
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={avatar}>{e.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{e.occupation || 'Not specified'}</div>
                    </div>
                  </div>
                  <a href={`tel:${e.mobile}`} style={mobileLink}>📱 {e.mobile}</a>
                </div>

                {/* Middle: interest */}
                <div style={{ flex: '2 1 260px' }}>
                  {e.locationName && (
                    <div style={metaRow}>
                      <span style={metaLabel}>Location</span>
                      <span style={locBadge}>{e.locationName}</span>
                    </div>
                  )}
                  {e.buildingName && (
                    <div style={metaRow}>
                      <span style={metaLabel}>Building</span>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{e.buildingName}</span>
                    </div>
                  )}
                  {e.roomName && (
                    <div style={metaRow}>
                      <span style={metaLabel}>Room Type</span>
                      <span style={{ fontSize: 13, color: '#374151' }}>{e.roomName}</span>
                    </div>
                  )}
                </div>

                {/* Right: date + actions */}
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={dateTag}>{fmt(e.createdAt)}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a
                      href={`https://wa.me/91${e.mobile}`}
                      target="_blank"
                      rel="noreferrer"
                      style={waBtn}
                    >
                      Reply on WhatsApp
                    </a>
                    <button onClick={() => handleDelete(e.id)} style={delBtn}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const h1 = { fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }
const subtext = { color: '#64748b', marginBottom: 24 }
const inputStyle = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', width: '100%' }
const card = { background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }
const emptyBox = { background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
const avatar = { width: 38, height: 38, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }
const mobileLink = { fontSize: 13, color: '#6366f1', fontWeight: 500, textDecoration: 'none' }
const metaRow = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }
const metaLabel = { fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 60 }
const locBadge = { fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#2563eb', borderRadius: 6, padding: '2px 8px' }
const dateTag = { fontSize: 11, color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px' }
const waBtn = { padding: '6px 12px', background: '#25d366', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }
const delBtn = { padding: '6px 12px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }
const dlBtn = { padding: '7px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
