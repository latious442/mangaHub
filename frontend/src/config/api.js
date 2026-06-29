export const API = import.meta.env.VITE_API_URL || ''

export function assetUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API}/uploads/${url}`
}
