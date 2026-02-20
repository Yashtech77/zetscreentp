import { useState, useEffect } from 'react'
import { authFetch } from '../api'
import API_BASE from '../../config'

const blankRoom = { type: '', originalPrice: '', price: '', period: '/month', popular: false, featuresText: '' }

export default function RoomsAdmin() {
  const [rooms, setRooms] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/rooms`).then(r => r.json()).then(setRooms).catch(() => {})
  }, [])

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const handleSave = async () => {
    const features = (editing.featuresText || '').split('\n').map(f => f.trim()).filter(Boolean)
    const payload = { type: editing.type, originalPrice: editing.originalPrice, price: editing.price, period: editing.period, popular: editing.popular, features }
    const isNew = !editing.id
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/rooms' : `/api/rooms/${editing.id}`
    try {
      const res = await authFetch(url, { method, body: JSON.stringify(payload) })
      if (!res.ok) return showMsg('Error saving room')
      const saved = await res.json()
      setRooms(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r))
      setEditing(null)
      showMsg('Room saved!')
    } catch {
      showMsg('Error saving room')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this room?')) return
    try {
      const res = await authFetch(`/api/rooms/${id}`, { method: 'DELETE' })
      if (!res.ok) return showMsg('Error deleting')
      setRooms(prev => prev.filter(r => r.id !== id))
      showMsg('Room deleted')
    } catch {
      showMsg('Error deleting')
    }
  }

  const openEdit = (room) => {
    setEditing({ ...room, featuresText: (room.features || []).join('\n') })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={h1}>Rooms</h1>
          <p style={subtext}>Manage room types and pricing.</p>
        </div>
        <button onClick={() => setEditing({ ...blankRoom })} style={addBtn}>+ Add Room</button>
      </div>

      {msg && <div style={successBar}>{msg}</div>}

      <div style={{ display: 'grid', gap: 16 }}>
        {rooms.map(room => (
          <div key={room.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>{room.type}</h3>
                  {room.popular && <span style={popularBadge}>Popular</span>}
                </div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                  <span style={{ textDecoration: 'line-through', marginRight: 8 }}>₹{room.originalPrice}</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{room.price}</span>{room.period}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{(room.features || []).join(' · ')}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(room)} style={editBtn}>Edit</button>
                <button onClick={() => handleDelete(room.id)} style={delBtn}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
              {editing.id ? 'Edit Room' : 'Add New Room'}
            </h2>
            <div style={grid2}>
              <Field label="Room Type" value={editing.type} onChange={v => setEditing(e => ({ ...e, type: v }))} />
              <Field label="Original Price (e.g. 6,250)" value={editing.originalPrice} onChange={v => setEditing(e => ({ ...e, originalPrice: v }))} />
              <Field label="Offer Price (e.g. 5,750)" value={editing.price} onChange={v => setEditing(e => ({ ...e, price: v }))} />
              <Field label="Period (e.g. /month)" value={editing.period} onChange={v => setEditing(e => ({ ...e, period: v }))} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={fieldLabel}>Features (one per line)</label>
              <textarea
                value={editing.featuresText || ''}
                onChange={e => setEditing(prev => ({ ...prev, featuresText: e.target.value }))}
                rows={6}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder={'Spacious room\nPrivate washroom\nHigh-speed WiFi'}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={!!editing.popular} onChange={e => setEditing(prev => ({ ...prev, popular: e.target.checked }))} />
                Mark as Most Popular
              </label>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <button onClick={handleSave} style={saveBtn}>Save</button>
              <button onClick={() => setEditing(null)} style={cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  )
}

const h1 = { fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }
const subtext = { color: '#64748b', margin: '4px 0 0' }
const card = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }
const fieldLabel = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none' }
const addBtn = { padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const saveBtn = { padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const cancelBtn = { padding: '10px 24px', background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const editBtn = { padding: '6px 14px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }
const delBtn = { padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }
const modal = { background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }
const popularBadge = { background: '#6366f1', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }
const successBar = { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '10px 16px', borderRadius: 6, marginBottom: 16, fontSize: 13 }
