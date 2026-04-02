<template>
  <AdminLayout>
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">Pedidos</h2>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Total: <span class="font-semibold text-gray-700 dark:text-gray-300">{{ total }}</span>
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="text-center py-12 text-gray-400 text-sm">Cargando pedidos...</div>
      <div v-else-if="error" class="rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-sm text-error-700 mb-4 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400">
        {{ error }}
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">#Pedido</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Cliente</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Total</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fecha</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Estado</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="pedido in pedidos"
                :key="pedido.id"
                class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition cursor-pointer"
                @click="verDetalle(pedido.id)"
              >
                <td class="px-5 py-4 sm:px-6">
                  <span class="font-bold text-gray-800 text-theme-sm dark:text-white/90">
                    #{{ String(pedido.id).padStart(5, '0') }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase flex-shrink-0">
                      {{ (pedido.nombre || 'U').charAt(0) }}
                    </div>
                    <div>
                      <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ pedido.nombre }} {{ pedido.apellido }}</span>
                      <span class="block text-gray-500 text-theme-xs">{{ pedido.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    ${{ Number(pedido.total_pedido || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}
                  </p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ pedido.created_at }}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span :class="[
                    'rounded-full px-2.5 py-0.5 text-theme-xs font-medium border',
                    pedido.mp_status === 'approved' || pedido.mp_status === 'in_process'
                      ? 'bg-success-50 text-success-700 border-success-100 dark:bg-success-500/15 dark:text-success-500 dark:border-success-500/20'
                      : 'bg-error-50 text-error-700 border-error-100 dark:bg-error-500/15 dark:text-error-500 dark:border-error-500/20'
                  ]">
                    {{ statusLabel(pedido.mp_status) }}
                  </span>
                </td>
              </tr>
              <tr v-if="pedidos.length === 0">
                <td colspan="5" class="px-5 py-12 text-center text-gray-400 text-theme-sm dark:text-gray-500">Sin pedidos registrados aún.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="total > 0" class="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 px-6 py-4 gap-4 dark:border-gray-800">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {{ (currentPage - 1) * limit + 1 }}–{{ Math.min(currentPage * limit, total) }} de {{ total }} pedidos
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

const API = 'http://localhost:3001/api/admin/pedidos'
const limit = 10

interface Pedido {
  id: number
  nombre: string
  apellido: string
  email: string
  total_pedido: number
  mp_status: string
  created_at: string
}

const pedidos = ref<Pedido[]>([])
const total = ref(0)
const currentPage = ref(1)
const loading = ref(true)
const error = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

const statusLabel = (status: string) => {
  if (status === 'approved' || status === 'in_process') return 'En proceso'
  if (status === 'completed') return 'Completado'
  return 'Fallido'
}

const verDetalle = (id: number) => {
  router.push(`/admin/pedidos/${id}`)
}

const fetchPedidos = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}?page=${page}&limit=${limit}`)
    if (!res.ok) throw new Error()
    const json = await res.json()
    pedidos.value = json.data
    total.value = json.total
    currentPage.value = json.page
  } catch {
    error.value = 'No se pudieron cargar los pedidos. Verifica que el servidor esté activo.'
  } finally {
    loading.value = false
  }
}

const cambiarPagina = (p: number) => {
  if (p < 1 || p > totalPages.value) return
  fetchPedidos(p)
}

onMounted(() => fetchPedidos(1))
</script>
