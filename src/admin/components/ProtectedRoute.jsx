import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authFetch, logout } from '../api'
import { PageLoader } from './Spinner'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      setStatus('unauthenticated')
      return
    }

    let alive = true
    authFetch('/api/auth/verify')
      .then(res => {
        if (!alive) return
        if (res.ok) {
          setStatus('authenticated')
        } else if (res.status === 401) {
          logout()
          setStatus('unauthenticated')
        } else {
          setStatus('unauthenticated')
        }
      })
      .catch(() => {
        if (!alive) return
        setStatus('unauthenticated')
      })

    return () => {
      alive = false
    }
  }, [])

  if (status === 'checking') {
    return <PageLoader />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
