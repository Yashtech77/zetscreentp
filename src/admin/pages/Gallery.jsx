import { useState, useEffect, useRef } from 'react'
import { authFetchForm } from '../api'
import API_BASE from '../../config'

export default function GalleryAdmin() {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [pending, setPending] = useState(null) // { file, preview, title }
  const fileRef = useRef()

  useEffect(() => {
    fetch(`${API_BASE}/api/gallery`).then(r => r.json()).then(setImages).catch(() => {})
  }, [])

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    const defaultTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    setPending({ file, preview, title: defaultTitle })
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'))
    if (!file) return
    const preview = URL.createObjectURL(file)
    const defaultTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    setPending({ file, preview, title: defaultTitle })
  }

  const handleUpload = async () => {
    if (!pending) return
    setUploading(true)
    const form = new FormData()
    form.append('image', pending.file)
    form.append('title', pending.title.trim() || pending.file.name)
    try {
      const res = await authFetchForm('/api/gallery', { method: 'POST', body: form })
      if (!res.ok) throw new Error()
      const newImg = await res.json()
      setImages(prev => [...prev, newImg])
      setPending(null)
      showMsg('Image uploaded!')
    } catch {
      showMsg('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return
    try {
      const res = await authFetchForm(`/api/gallery/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setImages(prev => prev.filter(img => img.id !== id))
      showMsg('Image deleted')
    } catch {
      showMsg('Error deleting image')
    }
  }

  return (
    <div>
      <h1 style={h1}>Gallery</h1>
      <p style={subtext}>Upload and manage photos shown in the gallery section.</p>

      {msg && <div style={msgBar(msg)}>{msg}</div>}

      {/* Upload drop zone */}
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#6366f1' : '#d1d5db'}`,
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? '#eef2ff' : '#fff',
          marginBottom: 28,
          transition: 'all 0.15s',
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display: 'none' }} />
        <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>
          Click or drag an image here to upload
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>Supports JPG, PNG, WebP • Max 10MB</div>
      </div>

      {/* Title input modal after selecting image */}
      {pending && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: '#1e293b' }}>Add Image</h3>
            <img
              src={pending.preview}
              alt="preview"
              style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
            />
            <label style={fieldLabel}>Image Title</label>
            <input
              type="text"
              value={pending.title}
              onChange={e => setPending(p => ({ ...p, title: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 20 }}
              placeholder="e.g. Building View"
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleUpload} disabled={uploading} style={uploadBtn}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button onClick={() => setPending(null)} style={cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Image grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {images.map(img => (
          <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#f1f5f9', aspectRatio: '4/3' }}>
            <img
              src={img.url.startsWith('/') ? `${API_BASE}${img.url}` : img.url}
              alt={img.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              padding: '20px 10px 8px',
              color: '#fff',
              fontSize: 12,
            }}>
              {img.title}
            </div>
            <button
              onClick={() => handleDelete(img.id)}
              style={{
                position: 'absolute', top: 6, right: 6,
                background: 'rgba(220,38,38,0.9)',
                border: 'none', borderRadius: '50%',
                width: 26, height: 26,
                cursor: 'pointer', color: '#fff',
                fontSize: 14, lineHeight: '26px', textAlign: 'center',
              }}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {images.length === 0 && !uploading && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No images yet. Upload some!</div>
      )}
    </div>
  )
}

const h1 = { fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }
const subtext = { color: '#64748b', marginBottom: 24 }
const fieldLabel = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none' }
const uploadBtn = { flex: 1, padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const cancelBtn = { flex: 1, padding: '10px', background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }
const modal = { background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 420 }
const msgBar = (msg) => ({
  background: msg.includes('Error') || msg.includes('failed') ? '#fef2f2' : '#f0fdf4',
  border: `1px solid ${msg.includes('Error') || msg.includes('failed') ? '#fecaca' : '#86efac'}`,
  color: msg.includes('Error') || msg.includes('failed') ? '#dc2626' : '#166534',
  padding: '10px 16px', borderRadius: 6, marginBottom: 16, fontSize: 13,
})
