import { useState } from 'react'
import { createPortal } from 'react-dom'
import API_BASE from '../config'

const OCCUPATIONS = ['Student', 'Working Professional', 'Business Owner', 'Other']

export default function EnquiryModal({ onClose, phoneNumber, locationName, buildingName, roomName }) {
  const [form, setForm] = useState({ name: '', mobile: '', occupation: 'Student' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter your name.'); return }
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile.trim())) {
      setError('Please enter a valid 10-digit mobile number.'); return
    }
    setError('')
    setLoading(true)

    const message = buildWhatsAppMessage(form, locationName, buildingName, roomName)

    try {
      await fetch(`${API_BASE}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          occupation: form.occupation,
          locationName,
          buildingName,
          roomName,
          message,
        }),
      })
    } catch { /* fire and forget */ }

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    setLoading(false)
    onClose()
  }

  return createPortal(
    <div className="eq-overlay" onClick={onClose}>
      <div className="eq-modal" onClick={e => e.stopPropagation()}>
        <button className="eq-close" onClick={onClose}>&#x2715;</button>

        <div className="eq-header">
          <div className="eq-wa-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h2 className="eq-title">Quick Enquiry</h2>
            <p className="eq-subtitle">
              {buildingName ? `${buildingName}${locationName ? ` · ${locationName}` : ''}` : 'Gurbaani Living PG'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="eq-form">
          <div className="eq-field">
            <label>Your Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </div>

          <div className="eq-field">
            <label>Mobile Number *</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={form.mobile}
              onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>

          <div className="eq-field">
            <label>Occupation</label>
            <div className="eq-occ-chips">
              {OCCUPATIONS.map(o => (
                <button
                  type="button"
                  key={o}
                  className={`eq-occ-chip${form.occupation === o ? ' active' : ''}`}
                  onClick={() => set('occupation', o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="eq-error">{error}</p>}

          <button type="submit" className="eq-submit" disabled={loading}>
            {loading ? 'Opening WhatsApp...' : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Continue to WhatsApp
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}

function buildWhatsAppMessage(form, locationName, buildingName, roomName) {
  let msg = `Hi, I'm interested in Gurbaani Living PG.\n\n`
  msg += `👤 Name: ${form.name}\n`
  msg += `📱 Mobile: ${form.mobile}\n`
  msg += `💼 Occupation: ${form.occupation}\n`
  if (locationName) msg += `📍 Location: ${locationName}\n`
  if (buildingName) msg += `🏠 Building: ${buildingName}\n`
  if (roomName)     msg += `🛏️ Room Type: ${roomName}\n`
  msg += `\nPlease share more details and availability.`
  return msg
}
