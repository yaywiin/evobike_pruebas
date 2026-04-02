<template>
  <AdminLayout>
    <div>
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">
          {{ modoEdicion ? 'Editar Usuario' : 'Agregar Nuevo Usuario' }}
        </h2>
        <router-link
          to="/admin/usuarios"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 transition dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Usuarios
        </router-link>
      </div>

      <!-- Loading (modo edición cargando datos) -->
      <div v-if="cargando" class="flex items-center justify-center py-16 text-gray-400 text-sm">Cargando datos del usuario...</div>

      <!-- Formulario -->
      <div v-else class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h3 class="font-medium text-gray-800 dark:text-white/90 text-lg">
            Información del Usuario
          </h3>
        </div>
        <form @submit.prevent="guardarUsuario">
          <div class="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Nombre Completo </label>
              <input v-model="formulario.nombre" type="text" placeholder="Ej. Juan Pérez" required
                class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Correo Electrónico </label>
              <input v-model="formulario.correo" type="email" placeholder="Ej. juan@correo.com" required
                class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Usuario (Login) </label>
              <input v-model="formulario.usuario" type="text" placeholder="Ej. juanp" required
                class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Rol </label>
              <div class="relative z-20 bg-transparent">
                <select v-model="formulario.rol" required
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800">
                  <option value="Administrador">Administrador</option>
                  <option value="Tienda">Tienda</option>
                </select>
                <span class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400">
                  <svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            <!-- Password: en edición es opcional -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Contraseña <span v-if="modoEdicion" class="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>
              </label>
              <input v-model="formulario.password" type="password" :placeholder="modoEdicion ? 'Nueva contraseña (opcional)' : 'Ingresa la contraseña'" :required="!modoEdicion"
                class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Confirmar Contraseña </label>
              <input v-model="formulario.confirmarPassword" type="password" :placeholder="modoEdicion ? 'Confirmar nueva contraseña' : 'Vuelve a ingresar la contraseña'" :required="!modoEdicion || !!formulario.password"
                class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              <p v-if="errorPassword" class="text-error-500 mt-2 text-sm">{{ errorPassword }}</p>
            </div>

            <!-- Error Servidor -->
            <div v-if="errorServidor" class="sm:col-span-2 rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-sm text-error-700 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400">
              {{ errorServidor }}
            </div>

            <!-- Botón de Guardado -->
            <div class="pt-2 sm:col-span-2 flex justify-end">
              <button type="submit" :disabled="guardando" class="inline-flex items-center justify-center rounded-lg bg-brand-500 px-8 py-3 font-medium text-white hover:bg-brand-600 transition shadow-theme-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar Usuario' : 'Guardar Usuario') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { fetchWithAuth } from '../../services/api'
const router = useRouter()
const route = useRoute()

const modoEdicion = computed(() => !!route.params.id)
const cargando = ref(false)

const formulario = ref({
  nombre: '',
  correo: '',
  usuario: '',
  rol: 'Administrador',
  password: '',
  confirmarPassword: ''
})

const errorPassword = ref('')
const errorServidor = ref('')
const guardando = ref(false)

// Si estamos en modo edición, cargar los datos del usuario
onMounted(async () => {
  if (!modoEdicion.value) return
  cargando.value = true
  try {
    const res = await fetchWithAuth(`/api/admin/usuarios/${route.params.id}`)
    if (!res.ok) throw new Error('Usuario no encontrado')
    const data = await res.json()
    formulario.value.nombre = data.nombre
    formulario.value.correo = data.correo
    formulario.value.usuario = data.usuario
    formulario.value.rol = data.rol
  } catch {
    errorServidor.value = 'No se pudieron cargar los datos del usuario'
  } finally {
    cargando.value = false
  }
})

const guardarUsuario = async () => {
  errorPassword.value = ''
  errorServidor.value = ''

  if (formulario.value.password && formulario.value.password !== formulario.value.confirmarPassword) {
    errorPassword.value = 'Las contraseñas no coinciden'
    return
  }

  guardando.value = true
  try {
    const isEdit = modoEdicion.value
    const url = isEdit ? `${API}/${route.params.id}` : API
    const method = isEdit ? 'PUT' : 'POST'

    const body: Record<string, string> = {
      nombre: formulario.value.nombre,
      correo: formulario.value.correo,
      usuario: formulario.value.usuario,
      rol: formulario.value.rol,
    }
    // Solo enviar password si se llenó
    if (formulario.value.password) {
      body.password = formulario.value.password
    }

    const res = await fetchWithAuth(modoEdicion.value ? `/api/admin/usuarios/${route.params.id}` : '/api/admin/usuarios', {
      method: modoEdicion.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error desconocido')
    router.push('/admin/usuarios')
  } catch (err: unknown) {
    errorServidor.value = err instanceof Error ? err.message : 'Error al guardar el usuario'
  } finally {
    guardando.value = false
  }
}
</script>
