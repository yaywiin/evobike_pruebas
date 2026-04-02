import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_URL } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(correo, password) {
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')

      token.value = data.token
      user.value = data.user
      
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.user))
      
      return data
    } catch (error) {
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return { token, user, isAuthenticated, login, logout }
})
