import { Navigate, useLocation } from 'react-router-dom'

function getJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=')
    return JSON.parse(window.atob(padded))
  } catch {
    return null
  }
}

function hasAdminToken() {
  const token = localStorage.getItem('adminToken')
  if (!token) return false

  const payload = getJwtPayload(token)
  if (!payload || payload.role !== 'admin') return false

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
    return false
  }

  return true
}

export default function AdminProtectedRoute({ children }) {
  const location = useLocation()

  if (!hasAdminToken()) {
    return <Navigate to="/admin" replace state={{ from: location }} />
  }

  return children
}
