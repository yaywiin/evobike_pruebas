import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('evobike_token') || null)
  const cliente = ref(JSON.parse(localStorage.getItem('evobike_cliente') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  function setSession(t, c) {
    token.value = t
    cliente.value = c
    localStorage.setItem('evobike_token', t)
    localStorage.setItem('evobike_cliente', JSON.stringify(c))
  }

  function logout() {
    token.value = null
    cliente.value = null
    localStorage.removeItem('evobike_token')
    localStorage.removeItem('evobike_cliente')
  }

  async function registro(datos) {
    const res = await fetch(`${API_URL}/api/clientes/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al registrar')
    setSession(data.token, data.cliente)
    return data
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/api/clientes/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas')
    setSession(data.token, data.cliente)
    return data
  }

  async function fetchPerfil() {
    const res = await fetch(`${API_URL}/api/clientes/perfil`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (!res.ok) { logout(); throw new Error('Sesión expirada') }
    const data = await res.json()
    cliente.value = data
    localStorage.setItem('evobike_cliente', JSON.stringify(data))
    return data
  }

  async function fetchPedidos() {
    const res = await fetch(`${API_URL}/api/clientes/pedidos`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (!res.ok) return []
    return await res.json()
  }

  async function fetchDirecciones() {
    const res = await fetch(`${API_URL}/api/clientes/direcciones`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (!res.ok) return []
    return await res.json()
  }

  return { token, cliente, isLoggedIn, registro, login, logout, fetchPerfil, fetchPedidos, fetchDirecciones }
})
