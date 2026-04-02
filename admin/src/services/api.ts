const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
// Limpiar diagonal al final si existe
export const API_URL = rawApiUrl.replace(/\/$/, '')

const rawClientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5174'
export const CLIENT_URL = rawClientUrl.replace(/\/$/, '')

/**
 * Helper para hacer peticiones autenticadas al servidor
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Si el token expiró o es inválido, limpiamos y mandamos al login desde aquí
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }

  return response
}
