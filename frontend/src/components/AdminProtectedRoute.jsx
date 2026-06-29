import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API } from '../config/api'

export default function AdminProtectedRoute({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('adminToken')

    if (!token) {
      setStatus('invalid')
      return undefined
    }

    axios.get(`${API}/admin/me`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (!active) return
      if (response.data?.ok) {
        localStorage.setItem('admin', JSON.stringify(response.data.admin))
        setStatus('valid')
      } else {
        setStatus('invalid')
      }
    }).catch(() => {
      if (!active) return
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      setStatus('invalid')
    })

    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-12 text-center text-gray-100">
        Checking admin access...
      </main>
    )
  }

  if (status !== 'valid') {
    return <Navigate to="/admin" replace state={{ from: location }} />
  }

  return children
}
