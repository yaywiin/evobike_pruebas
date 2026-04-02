<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900 transition-colors">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
      
      <!-- Logo/Brand Section -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-6 shadow-lg shadow-brand-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v1m0 16v1m0-11a3 3 0 110-6 3 3 0 010 6zm6.34 15.66a11.952 11.952 0 01-2.127-2.127M16.24 16.24l.094-.094A10.003 10.003 0 0012 21v-1m0-16V3m0 11l-6-6" />
          </svg>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Evobike</h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales para continuar</p>
      </div>

      <!-- Form Section -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
            <input 
              v-model="correo"
              id="email-address" 
              name="email" 
              type="email" 
              required 
              class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-gray-50 dark:bg-gray-800/50 transition-all" 
              placeholder="tu@correo.com"
            >
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <input 
              v-model="password"
              id="password" 
              name="password" 
              type="password" 
              required 
              class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-gray-50 dark:bg-gray-800/50 transition-all" 
              placeholder="••••••••"
            >
          </div>
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ error }}
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="loading"
            class="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Verificando...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const correo = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true
  error.value = ''
  
  try {
    await auth.login(correo.value, password.value)
    router.push('/admin') // Redirigir al dashboard después del login
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
