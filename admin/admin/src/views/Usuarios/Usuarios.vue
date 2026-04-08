<template>
  <AdminLayout>
    <div>
      <!-- Encabezado -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">Usuarios</h2>
        <router-link
          to="/admin/usuarios/nuevo"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Usuario
        </router-link>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">Cargando usuarios...</div>
      <div v-else-if="error" class="rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-sm text-error-700 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400 mb-4">
        {{ error }}
      </div>

      <!-- Tabla -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Usuario</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Correo</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fecha de Alta</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Rol</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition"
              >
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase flex-shrink-0">
                      {{ user.nombre.charAt(0) }}
                    </div>
                    <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ user.nombre }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.usuario }}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.correo }}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.created_at }}</p></td>
                <td class="px-5 py-4 sm:px-6">
                  <span :class="[
                    'rounded-full px-2.5 py-0.5 text-theme-xs font-medium',
                    user.rol === 'Administrador'
                      ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                  ]">{{ user.rol }}</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-3">
                    <!-- Ver -->
                    <button title="Ver" class="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <!-- Editar -->
                    <router-link :to="`/admin/usuarios/editar/${user.id}`" title="Editar" class="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </router-link>
                    <!-- Eliminar -->
                    <button title="Eliminar" @click="eliminarUsuario(user.id)" class="text-gray-400 hover:text-error-500 dark:hover:text-error-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="6" class="px-5 py-8 text-center text-gray-400 text-theme-sm dark:text-gray-500">Sin usuarios registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { fetchWithAuth } from '../../services/api'

interface AdminUser {
  id: number
  nombre: string
  usuario: string
  correo: string
  rol: string
  created_at: string
}

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref('')

const fetchUsuarios = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchWithAuth('/api/admin/usuarios')
    if (!res.ok) throw new Error(`Error ${res.status}`)
    users.value = await res.json()
  } catch (err: unknown) {
    error.value = 'No se pudieron cargar los usuarios. Verifica que el servidor esté activo.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const eliminarUsuario = async (id: number) => {
  if (!confirm('¿Estás seguro de eliminar este usuario?')) return
  try {
    const res = await fetchWithAuth(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar')
    users.value = users.value.filter(u => u.id !== id)
  } catch {
    alert('No se pudo eliminar el usuario')
  }
}

onMounted(fetchUsuarios)
</script>
