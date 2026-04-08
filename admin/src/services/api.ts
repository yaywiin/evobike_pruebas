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
  
  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }

  // Solo agregar application/json si no es FormData (para que el navegador setee el boundary del multipart automático)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // Merge custom headers if any
  const finalHeaders = { ...headers, ...options.headers }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: finalHeaders,
  })

  if (response.status === 401) {
    console.error('Sesión inválida o expirada. Redirigiendo al login...')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    // Usar replace para evitar que el botón "Atrás" te regrese a una página rota
    window.location.replace('/login')
    throw new Error('Sesión expirada')
  }

  return response
}
