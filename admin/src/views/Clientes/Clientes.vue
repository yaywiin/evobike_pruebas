<template>
  <AdminLayout>
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">Clientes</h2>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Total: <span class="font-semibold text-gray-700 dark:text-gray-300">{{ total }}</span>
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="text-center py-12 text-gray-400 text-sm">Cargando clientes...</div>
      <div v-else-if="error" class="rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-sm text-error-700 mb-4 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400">
        {{ error }}
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Teléfono</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Correo</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ciudad/Estado</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ultima Compra</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="cliente in clientes"
                :key="cliente.id"
                class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer"
                @click="verDetalle(cliente.id)"
              >
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase flex-shrink-0">
                      {{ (cliente.nombre || 'U').charAt(0) }}
                    </div>
                    <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ cliente.nombre }} {{ cliente.apellido }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.telefono || 'N/A' }}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.email }}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                    {{ cliente.ciudad }}{{ cliente.estado ? `, ${cliente.estado}` : '' }}
                  </p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.created_at }}</p>
                </td>
              </tr>
              <tr v-if="clientes.length === 0">
                <td colspan="5" class="px-5 py-12 text-center text-gray-400 text-theme-sm dark:text-gray-500">Sin clientes registrados aún.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="total > 0" class="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 px-6 py-4 gap-4 dark:border-gray-800">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {{ (currentPage - 1) * limit + 1 }}–{{ Math.min(currentPage * limit, total) }} de {{ total }} clientes
          </p>
          <div class="flex items-center gap-1">
            <button @click="cambiarPagina(currentPage - 1)" :disabled="currentPage === 1"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button v-for="p in totalPages" :key="p" @click="cambiarPagina(p)"
              :class="['h-9 w-9 rounded-lg text-sm font-medium transition', p === currentPage ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400']">
              {{ p }}
            </button>
            <button @click="cambiarPagina(currentPage + 1)" :disabled="currentPage === totalPages"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'

const router = useRouter()

const API = 'http://localhost:3001/api/admin/clientes'
const limit = 10

interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  ciudad: string
  estado: string
  total_pedido: number
  mp_status: string
  created_at: string
}

const clientes = ref<Cliente[]>([])
const total = ref(0)
const currentPage = ref(1)
const loading = ref(true)
const error = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

const verDetalle = (id: number) => {
  router.push(`/admin/clientes/${id}`)
}

const fetchClientes = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}?page=${page}&limit=${limit}`)
    if (!res.ok) throw new Error()
    const json = await res.json()
    clientes.value = json.data
    total.value = json.total
    currentPage.value = json.page
  } catch {
    error.value = 'No se pudieron cargar los clientes del servidor.'
  } finally {
    loading.value = false
  }
}

const cambiarPagina = (p: number) => {
  if (p < 1 || p > totalPages.value) return
  fetchClientes(p)
}

onMounted(() => fetchClientes(1))
</script>
