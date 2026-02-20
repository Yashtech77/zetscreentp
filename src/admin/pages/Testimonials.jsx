import { useState, useEffect } from 'react'
import { authFetch } from '../api'
import API_BASE from '../../config'

const blank = { name: '', role: '', rating: 5, text: '', date: '' }

export default function TestimonialsAdmin() {
  const [reviews, setReviews] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`).then(r => r.json()).then(setReviews).catch(() => {})
  }, [])

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const handleSave = async () => {
    const isNew = !editing.id
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/testimonials' : `/api/testimonials/${editing.id}`
    try {
      const res = await authFetch(url, { method, body: JSON.stringify(editing) })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      setReviews(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r))
      setEditing(null)
      showMsg('Saved!')
    } catch {
      showMsg('Error saving')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      const res = await authFetch(`/api/testimonials/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setReviews(prev => prev.filter(r => r.id !== id))
      showMsg('Deleted')
    } catch {
      showMsg('Error deleting')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={h1}>Testimonials</h1>
          <p style={subtext}>Manage resident reviews shown on the website.</p>
        </div>
        <button onClick={() => setEditing({ ...blank })} style={addBtn}>+ Add Review</button>
      </div>

      {msg && <div style={successBar}>{msg}</div>}

      <div style={{ display: 'grid', gap: 12 }}>
        {reviews.map(review => (
          <div key={review.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{review.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{review.role} · {review.date}</div>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: 13, marginLeft: 8 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                </div>
                <p style={{ fontSize: 13, color: '#475569', margin: 0, fontStyle: 'italic' }}>"{review.text}"</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing({ ...review })} style={editBtn}>Edit</button>
                <button onClick={() => handleDelete(review.id)} style={delBtn}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
              {editing.id ? 'Edit Review' : 'Add Review'}
            </h2>
            <div style={grid2}>
              <Field label="Name" value={editing.name} onChange={v => setEditing(e => ({ ...e, name: v }))} />
              <Field label="Role" value={editing.role} onChange={v => setEditing(e => ({ ...e, role: v }))} placeholder="e.g. Student" />
              <div>
                <label style={fieldLabel}>Rating</label>
                <select value={editing.rating} onChange={e => setEditing(prev => ({ ...prev, rating: parseInt(e.target.value) }))} style={inputStyle}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} stars {'★'.repeat(n)}</option>)}
                </select>
              </div>
              <Field label="Date" value={editing.date} onChange={v => setEditing(e => ({ ...e, date: v }))} placeholder="e.g. 2 months ago" />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={fieldLabel}>Review Text</label>
              <textarea
                value={editing.text || ''}
                onChange={e => setEditing(prev => ({ ...prev, text: e.target.value }))}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
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

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)} style={inputStyle} placeholder={placeholder} />
    </div>
  )
}

const h1 = { fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }
const subtext = { color: '#64748b', margin: '4px 0 0' }
const card = { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
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
const successBar = { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '10px 16px', borderRadius: 6, marginBottom: 16, fontSize: 13 }
