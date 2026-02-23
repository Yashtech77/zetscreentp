import { useState, useEffect } from 'react'
import { authFetch, authFetchForm } from '../api'
import API_BASE from '../../config'

// Detect short links that can't be embedded
function isShortLink(url) {
  return url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')
}

// Convert full Google Maps place URL to embeddable URL using coordinates
function toEmbedUrl(raw) {
  if (!raw) return ''
  const input = raw.trim()
  // If user pasted full <iframe> tag — extract the src
  const iframeSrc = input.match(/src="([^"]+)"/)
  if (iframeSrc) return iframeSrc[1]
  // Already an embed URL — keep as is
  if (input.includes('/maps/embed') || input.includes('output=embed')) return input
  // Short link — return as-is so warning shows
  if (isShortLink(input)) return input
  // Extract coordinates from place URL: /@lat,lng,zoom
  const coordMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=17&ie=UTF8&iwloc=&output=embed`
  }
  return input
}

const BUILDING_AMENITIES = ['WiFi', 'CCTV', 'RO Water', 'Fridge', 'Common Induction', 'Room Service', 'Washing Machine', 'Hot Water', 'Parking']
const ROOM_AMENITIES = ['Attached Bathroom', 'Common Bathroom', 'Wardrobe', 'Study Table', 'Fan']

function AmenityPicker({ value, onChange, suggestions }) {
  const selected = value ? value.split(',').map(a => a.trim()).filter(Boolean) : []

  const toggle = (a) => {
    const exists = selected.includes(a)
    const updated = exists ? selected.filter(x => x !== a) : [...selected, a]
    onChange(updated.join(', '))
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {suggestions.map(a => (
          <button
            key={a}
            type="button"
            onClick={() => toggle(a)}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              border: '1.5px solid',
              borderColor: selected.includes(a) ? '#6366f1' : '#d1d5db',
              background: selected.includes(a) ? '#6366f1' : '#fff',
              color: selected.includes(a) ? '#fff' : '#374151',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {a}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Or type custom amenities, comma separated"
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#374151' }}
      />
    </div>
  )
}

const TYPE_OPTIONS = [
  { value: 'boys',     label: 'Boys PG',   color: '#3b82f6' },
  { value: 'girls',    label: 'Girls PG',  color: '#ec4899' },
  { value: 'coliving', label: 'Co-living', color: '#8b5cf6' },
]
const OCCUPANCY_OPTIONS = [
  { value: 'double_attached', label: 'Double (Attached Bathroom)' },
  { value: 'double_sharing',  label: 'Double Sharing' },
  { value: 'triple_sharing',  label: 'Triple Sharing' },
]
const typeLabel = (t) => TYPE_OPTIONS.find(o => o.value === t)?.label || t
const typeColor = (t) => TYPE_OPTIONS.find(o => o.value === t)?.color || '#6366f1'

const emptyLocation = { name: '', slug: '', enabled: true, order: '', mapEmbed: '' }
const emptyBuilding = { name: '', type: 'boys', price: '', description: '', address: '', amenities: '', enabled: true }
const emptyRoom = { name: '', occupancy: 'double_attached', price: '', description: '', amenities: '', enabled: true }

const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export default function LocationsAdmin() {
  const [locations, setLocations] = useState([])
  const [activeLocId, setActiveLocId] = useState(null)
  const [expandedBldId, setExpandedBldId] = useState(null) // which building's rooms are expanded
  const [msg, setMsg] = useState('')

  // Location modal
  const [locModal, setLocModal] = useState(false)
  const [locForm, setLocForm] = useState(emptyLocation)
  const [locEditId, setLocEditId] = useState(null)

  // Building modal
  const [bldModal, setBldModal] = useState(false)
  const [bldForm, setBldForm] = useState(emptyBuilding)
  const [bldEditId, setBldEditId] = useState(null)

  // Room modal
  const [roomModal, setRoomModal] = useState(false)
  const [roomForm, setRoomForm] = useState(emptyRoom)
  const [roomEditId, setRoomEditId] = useState(null)
  const [roomBldId, setRoomBldId] = useState(null) // which building the room belongs to

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const load = () => {
    authFetch('/api/locations/all')
      .then(r => r.json())
      .then(data => {
        setLocations(data)
        if (!activeLocId && data.length > 0) setActiveLocId(data[0].id)
      })
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  const activeLoc = locations.find(l => l.id === activeLocId)

  // ── Location CRUD ──────────────────────────────────────────
  const openAddLocation = () => {
    setLocForm({ ...emptyLocation, order: locations.length + 1 })
    setLocEditId(null)
    setLocModal(true)
  }

  const openEditLocation = (loc) => {
    setLocForm({ name: loc.name, slug: loc.slug, enabled: loc.enabled, order: loc.order, mapEmbed: loc.mapEmbed || '' })
    setLocEditId(loc.id)
    setLocModal(true)
  }

  const saveLocation = async () => {
    if (!locForm.name.trim() || !locForm.slug.trim()) { showMsg('Name and slug required'); return }
    const payload = { ...locForm, slug: locForm.slug.toLowerCase().replace(/\s+/g, '-'), order: Number(locForm.order) || 99 }
    try {
      const res = locEditId
        ? await authFetch(`/api/locations/${locEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await authFetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      showMsg(locEditId ? 'Location updated!' : 'Location added!')
      setLocModal(false)
      load()
    } catch { showMsg('Error saving location') }
  }

  const toggleLocation = async (loc) => {
    try {
      await authFetch(`/api/locations/${loc.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: !loc.enabled }) })
      load()
    } catch { showMsg('Error') }
  }

  const deleteLocation = async (id) => {
    if (!confirm('Delete this location and all its buildings/photos?')) return
    try {
      const res = await authFetch(`/api/locations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showMsg('Location deleted')
      if (activeLocId === id) setActiveLocId(null)
      load()
    } catch { showMsg('Error deleting location') }
  }

  // ── Building CRUD ──────────────────────────────────────────
  const openAddBuilding = () => {
    setBldForm(emptyBuilding)
    setBldEditId(null)
    setBldModal(true)
  }

  const openEditBuilding = (b) => {
    setBldForm({ name: b.name, type: b.type, price: b.price, description: b.description || '', address: b.address || '', amenities: (b.amenities || []).join(', '), enabled: b.enabled })
    setBldEditId(b.id)
    setBldModal(true)
  }

  const saveBuilding = async () => {
    if (!bldForm.name.trim()) { showMsg('Building name required'); return }
    const payload = { ...bldForm, price: Number(bldForm.price) || 0, amenities: bldForm.amenities }
    try {
      const res = bldEditId
        ? await authFetch(`/api/locations/${activeLocId}/buildings/${bldEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await authFetch(`/api/locations/${activeLocId}/buildings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      showMsg(bldEditId ? 'Building updated!' : 'Building added!')
      setBldModal(false)
      load()
    } catch { showMsg('Error saving building') }
  }

  const toggleBuilding = async (b) => {
    try {
      await authFetch(`/api/locations/${activeLocId}/buildings/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: !b.enabled }) })
      load()
    } catch { showMsg('Error') }
  }

  const deleteBuilding = async (bid) => {
    if (!confirm('Delete this building and all its photos/rooms?')) return
    try {
      const res = await authFetch(`/api/locations/${activeLocId}/buildings/${bid}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showMsg('Building deleted')
      if (expandedBldId === bid) setExpandedBldId(null)
      load()
    } catch { showMsg('Error deleting building') }
  }

  // ── Building photo ─────────────────────────────────────────
  const uploadBldPhoto = async (bid, file) => {
    const fd = new FormData()
    fd.append('photo', file)
    try {
      const res = await authFetchForm(`/api/locations/${activeLocId}/buildings/${bid}/photos`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      showMsg('Photo uploaded!')
      load()
    } catch { showMsg('Error uploading photo') }
  }

  const deleteBldPhoto = async (bid, url) => {
    if (!confirm('Delete this photo?')) return
    try {
      await authFetch(`/api/locations/${activeLocId}/buildings/${bid}/photos`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      load()
    } catch { showMsg('Error deleting photo') }
  }

  // ── Room CRUD ──────────────────────────────────────────────
  const openAddRoom = (bid) => {
    setRoomForm(emptyRoom)
    setRoomEditId(null)
    setRoomBldId(bid)
    setRoomModal(true)
  }

  const openEditRoom = (bid, room) => {
    setRoomForm({ name: room.name, occupancy: room.occupancy, price: room.price, description: room.description || '', amenities: (room.amenities || []).join(', '), enabled: room.enabled })
    setRoomEditId(room.id)
    setRoomBldId(bid)
    setRoomModal(true)
  }

  const saveRoom = async () => {
    if (!roomForm.name.trim()) { showMsg('Room name required'); return }
    const payload = { ...roomForm, price: Number(roomForm.price) || 0, amenities: roomForm.amenities }
    try {
      const res = roomEditId
        ? await authFetch(`/api/locations/${activeLocId}/buildings/${roomBldId}/rooms/${roomEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await authFetch(`/api/locations/${activeLocId}/buildings/${roomBldId}/rooms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      showMsg(roomEditId ? 'Room updated!' : 'Room added!')
      setRoomModal(false)
      load()
    } catch { showMsg('Error saving room') }
  }

  const deleteRoom = async (bid, rid) => {
    if (!confirm('Delete this room type?')) return
    try {
      await authFetch(`/api/locations/${activeLocId}/buildings/${bid}/rooms/${rid}`, { method: 'DELETE' })
      showMsg('Room deleted')
      load()
    } catch { showMsg('Error deleting room') }
  }

  const uploadRoomPhoto = async (bid, rid, file) => {
    const fd = new FormData()
    fd.append('photo', file)
    try {
      const res = await authFetchForm(`/api/locations/${activeLocId}/buildings/${bid}/rooms/${rid}/photos`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      showMsg('Photo uploaded!')
      load()
    } catch { showMsg('Error uploading photo') }
  }

  const deleteRoomPhoto = async (bid, rid, url) => {
    if (!confirm('Delete this photo?')) return
    try {
      await authFetch(`/api/locations/${activeLocId}/buildings/${bid}/rooms/${rid}/photos`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      load()
    } catch { showMsg('Error deleting photo') }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 style={s.h1}>Locations & Buildings</h1>
          <p style={s.sub}>Manage areas, PG buildings, room types, and photos.</p>
        </div>
        <button onClick={openAddLocation} style={s.addBtn}>+ Add Location</button>
      </div>

      {msg && <div style={s.msgBar(msg)}>{msg}</div>}

      {/* Location Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '20px 0 0' }}>
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => setActiveLocId(loc.id)}
            style={{ ...s.locTab, background: activeLocId === loc.id ? '#6366f1' : '#e0e7ff', color: activeLocId === loc.id ? '#fff' : '#4338ca', opacity: loc.enabled ? 1 : 0.55 }}
          >
            {loc.name}
            <span style={{ marginLeft: 6, fontSize: 11, background: 'rgba(255,255,255,0.3)', borderRadius: 10, padding: '1px 6px' }}>
              {(loc.buildings || []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Location Panel */}
      {activeLoc && (
        <div style={{ marginTop: 20 }}>
          {/* Location meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '14px 18px', background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{activeLoc.name}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>/{activeLoc.slug}</span>
              {!activeLoc.enabled && <span style={{ marginLeft: 8, fontSize: 11, color: '#dc2626', background: '#fee2e2', borderRadius: 8, padding: '2px 8px' }}>Disabled</span>}
            </div>
            <button onClick={() => openEditLocation(activeLoc)} style={s.editBtn}>Edit</button>
            <button onClick={() => toggleLocation(activeLoc)} style={{ ...s.toggleBtn, background: activeLoc.enabled ? '#fef3c7' : '#d1fae5', color: activeLoc.enabled ? '#92400e' : '#065f46' }}>
              {activeLoc.enabled ? 'Disable' : 'Enable'}
            </button>
            <button onClick={() => deleteLocation(activeLoc.id)} style={s.delBtn}>Delete</button>
          </div>

          {/* Buildings section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              Buildings <span style={{ fontWeight: 400, color: '#64748b', fontSize: 13 }}>({(activeLoc.buildings || []).length})</span>
            </h3>
            <button onClick={openAddBuilding} style={s.addBldBtn}>+ Add Building</button>
          </div>

          {(activeLoc.buildings || []).length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40, background: '#fff', borderRadius: 10, border: '2px dashed #e2e8f0' }}>
              No buildings yet. Click "+ Add Building".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(activeLoc.buildings || []).map(b => (
                <div key={b.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${typeColor(b.type)}`, opacity: b.enabled ? 1 : 0.6 }}>

                  {/* Building header row */}
                  <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{b.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: typeColor(b.type) + '18', color: typeColor(b.type) }}>{typeLabel(b.type)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, marginTop: 2 }}>
                        ₹{(b.price || 0).toLocaleString('en-IN')}/month
                        <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 6 }}>• {(b.roomTypes || []).length} room types</span>
                      </div>
                    </div>
                    <button onClick={() => openEditBuilding(b)} style={s.editBtn}>Edit</button>
                    <button onClick={() => toggleBuilding(b)} style={{ ...s.toggleBtn, background: b.enabled ? '#fef3c7' : '#d1fae5', color: b.enabled ? '#92400e' : '#065f46' }}>
                      {b.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => setExpandedBldId(expandedBldId === b.id ? null : b.id)}
                      style={{ ...s.editBtn, background: expandedBldId === b.id ? '#6366f1' : '#e0e7ff', color: expandedBldId === b.id ? '#fff' : '#4338ca' }}
                    >
                      {expandedBldId === b.id ? 'Hide Rooms ▲' : 'Manage Rooms ▼'}
                    </button>
                    <button onClick={() => deleteBuilding(b.id)} style={s.delBtn}>Delete</button>
                  </div>

                  {/* Building photos row */}
                  <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {(b.photos || []).map((url, pi) => (
                      <div key={pi} style={{ position: 'relative' }}>
                        <img src={`${API_BASE}${url}`} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                        <button onClick={() => deleteBldPhoto(b.id, url)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                    <label style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px dashed #cbd5e1' }}>
                      + Building Photo
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadBldPhoto(b.id, e.target.files[0]); e.target.value = '' }} />
                    </label>
                  </div>

                  {/* Room Types Panel (expanded) */}
                  {expandedBldId === b.id && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 18px', background: '#fafbff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                          Room Types <span style={{ color: '#64748b', fontWeight: 400 }}>({(b.roomTypes || []).length})</span>
                        </span>
                        <button onClick={() => openAddRoom(b.id)} style={{ ...s.addBldBtn, background: '#8b5cf6' }}>+ Add Room Type</button>
                      </div>

                      {(b.roomTypes || []).length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', background: '#fff', borderRadius: 8, border: '2px dashed #e2e8f0' }}>
                          No room types yet. Click "+ Add Room Type".
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                          {(b.roomTypes || []).map(room => (
                            <div key={room.id} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', opacity: room.enabled ? 1 : 0.6 }}>
                              {/* Room photos */}
                              <div style={{ background: '#f8fafc', minHeight: 80, padding: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                {(room.photos || []).map((url, pi) => (
                                  <div key={pi} style={{ position: 'relative' }}>
                                    <img src={`${API_BASE}${url}`} alt="" style={{ width: 70, height: 55, objectFit: 'cover', borderRadius: 5 }} />
                                    <button onClick={() => deleteRoomPhoto(b.id, room.id, url)} style={{ position: 'absolute', top: 1, right: 1, background: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                  </div>
                                ))}
                                <label style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                  + Photo
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadRoomPhoto(b.id, room.id, e.target.files[0]); e.target.value = '' }} />
                                </label>
                              </div>

                              {/* Room info */}
                              <div style={{ padding: '10px 12px' }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 3 }}>{room.name}</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 3 }}>
                                  {OCCUPANCY_OPTIONS.find(o => o.value === room.occupancy)?.label || room.occupancy}
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', marginBottom: 6 }}>
                                  ₹{(room.price || 0).toLocaleString('en-IN')}<span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>/month</span>
                                </div>
                                {room.description && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{room.description}</div>}
                                {(room.amenities || []).length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
                                    {room.amenities.map((a, i) => <span key={i} style={{ fontSize: 10, background: '#f1f5f9', color: '#475569', borderRadius: 6, padding: '1px 6px' }}>{a}</span>)}
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => openEditRoom(b.id, room)} style={{ ...s.editBtn, fontSize: 11, padding: '4px 10px' }}>Edit</button>
                                  <button onClick={() => deleteRoom(b.id, room.id)} style={{ ...s.delBtn, fontSize: 11, padding: '4px 10px', marginLeft: 'auto' }}>Delete</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {locations.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 60 }}>No locations yet. Click "+ Add Location".</div>
      )}

      {/* Location Modal */}
      {locModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>{locEditId ? 'Edit Location' : 'Add Location'}</h3>
            <label style={s.label}>Area Name *</label>
            <input value={locForm.name} onChange={e => setLocForm(p => ({ ...p, name: e.target.value, slug: locEditId ? p.slug : autoSlug(e.target.value) }))} style={{ ...s.input, marginBottom: 12 }} placeholder="e.g. Akurdi" autoFocus />
            <label style={s.label}>Slug *</label>
            <input value={locForm.slug} onChange={e => setLocForm(p => ({ ...p, slug: e.target.value }))} style={{ ...s.input, marginBottom: 12 }} placeholder="e.g. akurdi" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={s.label}>Display Order</label><input type="number" value={locForm.order} onChange={e => setLocForm(p => ({ ...p, order: e.target.value }))} style={s.input} placeholder="1" min="1" /></div>
            </div>
            <label style={s.label}>Google Maps Location URL</label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
              <strong>How to get the URL:</strong><br />
              1. Open <strong>Google Maps</strong> and search your PG location<br />
              2. Click <strong>Share</strong> → <strong>Embed a map</strong><br />
              3. Click <strong>Copy HTML</strong> and paste the whole thing below — the <code style={{ background: '#e2e8f0', padding: '0 4px', borderRadius: 3 }}>&lt;iframe&gt;</code> code is auto-handled<br />
              <span style={{ color: '#ef4444' }}>✗ Short links (maps.app.goo.gl) won't work.</span>
            </div>
            <input
              value={locForm.mapEmbed}
              onChange={e => setLocForm(p => ({ ...p, mapEmbed: toEmbedUrl(e.target.value) }))}
              style={{ ...s.input, marginBottom: 8 }}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            {locForm.mapEmbed && isShortLink(locForm.mapEmbed) && (
              <div style={{ marginBottom: 8, padding: '8px 12px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, fontSize: 12, color: '#92400e' }}>
                ⚠️ This looks like a short link. Please open it in your browser, then copy the full URL from the address bar and paste that here instead.
              </div>
            )}
            {locForm.mapEmbed && !isShortLink(locForm.mapEmbed) && (
              <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <iframe
                  src={locForm.mapEmbed}
                  width="100%"
                  height="200"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map preview"
                />
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" checked={locForm.enabled} onChange={e => setLocForm(p => ({ ...p, enabled: e.target.checked }))} />
              Enabled (visible on website)
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveLocation} style={s.saveBtn}>Save</button>
              <button onClick={() => setLocModal(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Building Modal */}
      {bldModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>{bldEditId ? 'Edit Building' : 'Add Building'} — {activeLoc?.name}</h3>
            <label style={s.label}>Building Name *</label>
            <input value={bldForm.name} onChange={e => setBldForm(p => ({ ...p, name: e.target.value }))} style={{ ...s.input, marginBottom: 12 }} placeholder="e.g. Boys PG - Block A" autoFocus />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={s.label}>Type *</label>
                <select value={bldForm.type} onChange={e => setBldForm(p => ({ ...p, type: e.target.value }))} style={s.input}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div><label style={s.label}>Starting Price (₹/month)</label>
                <input type="number" value={bldForm.price} onChange={e => setBldForm(p => ({ ...p, price: e.target.value }))} style={s.input} placeholder="e.g. 4000" min="0" />
              </div>
            </div>
            <label style={s.label}>Description</label>
            <input value={bldForm.description} onChange={e => setBldForm(p => ({ ...p, description: e.target.value }))} style={{ ...s.input, marginBottom: 12 }} placeholder="Short description" />
            <label style={s.label}>Address</label>
            <input value={bldForm.address} onChange={e => setBldForm(p => ({ ...p, address: e.target.value }))} style={{ ...s.input, marginBottom: 12 }} placeholder="Full address" />
            <label style={s.label}>Amenities</label>
            <AmenityPicker
              value={bldForm.amenities}
              onChange={v => setBldForm(p => ({ ...p, amenities: v }))}
              suggestions={BUILDING_AMENITIES}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" checked={bldForm.enabled} onChange={e => setBldForm(p => ({ ...p, enabled: e.target.checked }))} />
              Enabled (visible on website)
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveBuilding} style={s.saveBtn}>Save</button>
              <button onClick={() => setBldModal(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Room Type Modal */}
      {roomModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>{roomEditId ? 'Edit Room Type' : 'Add Room Type'}</h3>
            <label style={s.label}>Room Name *</label>
            <input value={roomForm.name} onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))} style={{ ...s.input, marginBottom: 12 }} placeholder="e.g. Single Occupancy" autoFocus />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={s.label}>Occupancy Type *</label>
                <select value={roomForm.occupancy} onChange={e => setRoomForm(p => ({ ...p, occupancy: e.target.value }))} style={s.input}>
                  {OCCUPANCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div><label style={s.label}>Price (₹/month per person)</label>
                <input type="number" value={roomForm.price} onChange={e => setRoomForm(p => ({ ...p, price: e.target.value }))} style={s.input} placeholder="e.g. 7000" min="0" />
              </div>
            </div>
            <label style={s.label}>Description</label>
            <input value={roomForm.description} onChange={e => setRoomForm(p => ({ ...p, description: e.target.value }))} style={{ ...s.input, marginBottom: 12 }} placeholder="e.g. Private room with attached bathroom" />
            <label style={s.label}>Amenities</label>
            <AmenityPicker
              value={roomForm.amenities}
              onChange={v => setRoomForm(p => ({ ...p, amenities: v }))}
              suggestions={ROOM_AMENITIES}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" checked={roomForm.enabled} onChange={e => setRoomForm(p => ({ ...p, enabled: e.target.checked }))} />
              Enabled (visible on website)
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveRoom} style={s.saveBtn}>Save</button>
              <button onClick={() => setRoomModal(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  h1: { fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
  sub: { color: '#64748b', marginBottom: 0 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  addBtn: { padding: '9px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  addBldBtn: { padding: '7px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  locTab: { padding: '8px 16px', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' },
  editBtn: { padding: '5px 12px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  toggleBtn: { padding: '5px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  delBtn: { padding: '5px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { flex: 1, padding: 10, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: 10, background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { margin: '0 0 18px', fontSize: 17, fontWeight: 700, color: '#1e293b' },
  msgBar: (msg) => ({
    background: msg.includes('Error') ? '#fef2f2' : '#f0fdf4',
    border: `1px solid ${msg.includes('Error') ? '#fecaca' : '#86efac'}`,
    color: msg.includes('Error') ? '#dc2626' : '#166534',
    padding: '10px 16px', borderRadius: 6, marginBottom: 16, fontSize: 13,
  }),
}
