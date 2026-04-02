<template>
  <AdminLayout>
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">Productos</h2>
        <router-link
          to="/admin/productos/nuevo"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Producto
        </router-link>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="text-center py-12 text-gray-400 text-sm">Cargando productos...</div>
      <div v-else-if="error" class="rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-sm text-error-700 mb-4 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400">
        {{ error }}
      </div>

      <!-- Tabla -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Precio</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Categoría</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Alta</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Estado</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="producto in productos"
                :key="producto.id"
                class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition"
              >
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-3">
                    <div class="h-12 w-12 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <img v-if="producto.foto_principal" :src="producto.foto_principal" :alt="producto.nombre" class="object-contain h-full w-full" />
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ producto.nombre }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex flex-col gap-0.5">
                    <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">${{ Number(producto.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</p>
                    <p v-if="producto.descuento_porcentaje > 0" class="text-xs text-success-600 dark:text-success-400 font-medium">-{{ producto.descuento_porcentaje }}% OFF</p>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="rounded-full px-2.5 py-0.5 text-theme-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                    {{ producto.categoria || '—' }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ producto.created_at }}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span :class="[
                    'rounded-full px-2.5 py-0.5 text-theme-xs font-medium',
                    producto.publicado
                      ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  ]">
                    {{ producto.publicado ? 'Público' : 'Borrador' }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-3">
                    <a :href="`${CLIENT_URL}/product/${producto.id}`" target="_blank" title="Ver en tienda" class="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                    <router-link :to="`/admin/productos/editar/${producto.id}`" title="Editar" class="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </router-link>
                    <button title="Eliminar" @click="eliminarProducto(producto.id)" class="text-gray-400 hover:text-error-500 dark:hover:text-error-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="productos.length === 0">
                <td colspan="6" class="px-5 py-12 text-center text-gray-400 text-theme-sm dark:text-gray-500">Sin productos dados de alta.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="total > 0" class="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 px-6 py-4 gap-4 dark:border-gray-800">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {{ (currentPage - 1) * limit + 1 }}–{{ Math.min(currentPage * limit, total) }} de {{ total }} productos
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="cambiarPagina(currentPage - 1)"
              :disabled="currentPage === 1"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              v-for="p in totalPages" :key="p"
              @click="cambiarPagina(p)"
              :class="[
                'h-9 w-9 rounded-lg text-sm font-medium transition',
                p === currentPage
                  ? 'bg-brand-500 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]'
              ]"
            >{{ p }}</button>
            <button
              @click="cambiarPagina(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchWithAuth, CLIENT_URL } from '../../services/api'
const limit = 10

interface Producto {
  id: number
  nombre: string
  precio: number
  descuento_porcentaje: number
  categoria: string
  publicado: boolean
  foto_principal: string | null
  created_at: string
  autor: string
}

const productos = ref<Producto[]>([])
const total = ref(0)
const currentPage = ref(1)
const loading = ref(true)
const error = ref('')

const totalPages = computed(() => Math.ceil(total.value / limit))

const fetchProductos = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchWithAuth(`/api/admin/productos?page=${page}&limit=${limit}`)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const json = await res.json()
    productos.value = json.data
    total.value = json.total
    currentPage.value = json.page
  } catch {
    error.value = 'No se pudieron cargar los productos. Verifica que el servidor esté activo.'
  } finally {
    loading.value = false
  }
}

const cambiarPagina = (p: number) => {
  if (p < 1 || p > totalPages.value) return
  fetchProductos(p)
}

const eliminarProducto = async (id: number) => {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return
  try {
    const res = await fetchWithAuth(`/api/admin/productos/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    fetchProductos(currentPage.value)
  } catch {
    alert('No se pudo eliminar el producto')
  }
}

onMounted(() => fetchProductos(1))
</script>
