import { useState, useEffect } from 'react'
import { authFetch } from '../api'
import API_BASE from '../../config'

export default function Offers() {
  const [offer, setOffer] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/offers`).then(r => r.json()).then(setOffer).catch(() => {})
  }, [])

  const handleChange = (field, value) => {
    setOffer(o => ({ ...o, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      const res = await authFetch('/api/offers', {
        method: 'PUT',
        body: JSON.stringify(offer),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setOffer(updated)
      setMsg('Saved successfully!')
    } catch {
      setMsg('Error saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!offer) return <div style={{ color: '#64748b' }}>Loading...</div>

  return (
    <div>
      <h1 style={h1}>Offers Banner</h1>
      <p style={subtext}>Control the promotional banner shown at the top of the website.</p>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <label style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Banner Status</label>
          <button
            onClick={() => handleChange('enabled', !offer.enabled)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              background: offer.enabled ? '#10b981' : '#e2e8f0',
              color: offer.enabled ? '#fff' : '#64748b',
            }}
          >
            {offer.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div style={grid2}>
          <Field label="Banner Title" value={offer.title} onChange={v => handleChange('title', v)} />
          <Field label="Subtitle" value={offer.subtitle} onChange={v => handleChange('subtitle', v)} />
          <Field label="Discount Text (banner display)" value={offer.discount} onChange={v => handleChange('discount', v)} placeholder="e.g. 10% OFF" />
          <div>
            <label style={fieldLabel}>Discount % (applied to room prices)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={offer.discountPercent ?? 0}
              onChange={e => handleChange('discountPercent', Number(e.target.value))}
              style={inputStyle}
              placeholder="e.g. 10"
            />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Room prices will show original crossed-out + discounted price when banner is enabled.
            </p>
          </div>
          <Field label="Valid Until" value={offer.validUntil} onChange={v => handleChange('validUntil', v)} type="date" />
          <div>
            <label style={fieldLabel}>Background Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={offer.bgColor || '#1a1a2e'} onChange={e => handleChange('bgColor', e.target.value)} style={{ width: 48, height: 36, cursor: 'pointer', border: 'none' }} />
              <input type="text" value={offer.bgColor || ''} onChange={e => handleChange('bgColor', e.target.value)} style={inputStyle} placeholder="#1a1a2e" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleSave} disabled={saving} style={saveBtn}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {msg && <span style={{ fontSize: 13, color: msg.includes('Error') ? '#dc2626' : '#10b981' }}>{msg}</span>}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

const h1 = { fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }
const subtext = { color: '#64748b', marginBottom: 24 }
const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }
const fieldLabel = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none' }
const saveBtn = { padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }
