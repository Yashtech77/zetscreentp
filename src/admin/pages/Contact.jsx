import { useState, useEffect } from 'react'
import { authFetch } from '../api'

export default function ContactAdmin() {
  const [contact, setContact] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/contact').then(r => r.json()).then(setContact).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      const res = await authFetch('/api/contact', { method: 'PUT', body: JSON.stringify(contact) })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setContact(updated)
      setMsg('Saved successfully!')
    } catch {
      setMsg('Error saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field, value) => setContact(c => ({ ...c, [field]: value }))

  const updateStat = (idx, key, value) => {
    const stats = [...(contact.stats || [])]
    stats[idx] = { ...stats[idx], [key]: value }
    setContact(c => ({ ...c, stats }))
  }

  const updateBranch = (idx, key, value) => {
    const branches = [...(contact.branches || [])]
    branches[idx] = { ...branches[idx], [key]: value }
    setContact(c => ({ ...c, branches }))
  }

  const addBranch = () => {
    setContact(c => ({ ...c, branches: [...(c.branches || []), { name: '', area: '', address: '', phone: '' }] }))
  }

  const removeBranch = (idx) => {
    setContact(c => ({ ...c, branches: c.branches.filter((_, i) => i !== idx) }))
  }

  if (!contact) return <div style={{ color: '#64748b' }}>Loading...</div>

  return (
    <div>
      <h1 style={h1}>Contact Info</h1>
      <p style={subtext}>Update contact details shown across the website.</p>

      {msg && <div style={{ ...successBar, background: msg.includes('Error') ? '#fef2f2' : '#f0fdf4', borderColor: msg.includes('Error') ? '#fecaca' : '#86efac', color: msg.includes('Error') ? '#dc2626' : '#166534' }}>{msg}</div>}

      <div style={{ display: 'grid', gap: 20 }}>
        <section style={card}>
          <h2 style={sectionTitle}>Basic Contact Details</h2>
          <div style={grid2}>
            <Field label="Phone" value={contact.phone} onChange={v => updateField('phone', v)} placeholder="+91 91759 16383" />
            <Field label="WhatsApp Number (digits only)" value={contact.whatsapp} onChange={v => updateField('whatsapp', v)} placeholder="919175916383" />
            <Field label="Email" value={contact.email} onChange={v => updateField('email', v)} placeholder="email@example.com" />
            <Field label="Visiting Hours" value={contact.hours} onChange={v => updateField('hours', v)} placeholder="Mon - Sun: 9:00 AM - 8:00 PM" />
          </div>
          <div style={{ marginTop: 16 }}>
            <Field label="Short Address (used in footer)" value={contact.address} onChange={v => updateField('address', v)} />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={fieldLabel}>Full Address (used in location section)</label>
            <textarea
              value={contact.addressFull || ''}
              onChange={e => updateField('addressFull', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Stats</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {(contact.stats || []).map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: '0 0 120px' }}>
                  <Field label={idx === 0 ? 'Number' : ''} value={stat.number} onChange={v => updateStat(idx, 'number', v)} placeholder="2000+" />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label={idx === 0 ? 'Label' : ''} value={stat.label} onChange={v => updateStat(idx, 'label', v)} placeholder="Happy Residents" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ ...sectionTitle, margin: 0 }}>Branches</h2>
            <button onClick={addBranch} style={addBtn}>+ Add Branch</button>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {(contact.branches || []).map((branch, idx) => (
              <div key={idx} style={{ background: '#f8fafc', borderRadius: 8, padding: 16, position: 'relative' }}>
                <button
                  onClick={() => removeBranch(idx)}
                  style={{ position: 'absolute', top: 10, right: 10, background: '#fee2e2', border: 'none', borderRadius: 4, color: '#dc2626', cursor: 'pointer', padding: '2px 8px', fontSize: 12 }}
                >
                  Remove
                </button>
                <div style={grid2}>
                  <Field label="Branch Name" value={branch.name} onChange={v => updateBranch(idx, 'name', v)} />
                  <Field label="Area" value={branch.area} onChange={v => updateBranch(idx, 'area', v)} />
                  <Field label="Phone" value={branch.phone} onChange={v => updateBranch(idx, 'phone', v)} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <Field label="Address" value={branch.address} onChange={v => updateBranch(idx, 'address', v)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={handleSave} disabled={saving} style={saveBtn}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
        {msg && <span style={{ fontSize: 13, color: msg.includes('Error') ? '#dc2626' : '#10b981' }}>{msg}</span>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      {label && <label style={fieldLabel}>{label}</label>}
      <input value={value || ''} onChange={e => onChange(e.target.value)} style={inputStyle} placeholder={placeholder} />
    </div>
  )
}

const h1 = { fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }
const subtext = { color: '#64748b', marginBottom: 24 }
const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
const sectionTitle = { fontSize: 16, fontWeight: 600, color: '#1e293b', marginTop: 0, marginBottom: 16 }
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }
const fieldLabel = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none' }
const addBtn = { padding: '7px 14px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }
const saveBtn = { padding: '12px 28px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }
const successBar = { padding: '10px 16px', borderRadius: 6, border: '1px solid', marginBottom: 16, fontSize: 13 }
