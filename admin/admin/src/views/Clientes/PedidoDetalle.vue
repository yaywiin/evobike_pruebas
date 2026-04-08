<template>
  <AdminLayout>
    <div v-if="loading" class="text-center py-20 text-gray-500">Cargando pedido...</div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">{{ error }}</div>
    <div v-else-if="pedido">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <router-link to="/admin/pedidos" class="text-gray-400 hover:text-gray-600">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7 7-7" />
               </svg>
            </router-link>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white/90">
              Pedido #{{ String(pedido.id).padStart(5, '0') }}
            </h2>
          </div>
          <p class="text-gray-500 text-sm pl-9">Realizado el {{ pedido.fecha_compra }}</p>
        </div>
        
        <div class="flex items-center gap-3">
           <span :class="[
            'px-4 py-1.5 rounded-full font-bold text-sm border shadow-sm',
            statusColor(pedido.mp_status)
          ]">
            {{ statusLabel(pedido.mp_status) }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Columna Izquierda (2/3): Datos del Cliente -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <h3 class="font-bold text-xl text-gray-800 dark:text-white/90 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Cliente
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Nombre</p>
                <p class="text-gray-700 dark:text-gray-200 text-lg">{{ pedido.nombre }} {{ pedido.apellido }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Correo Electrónico</p>
                <p class="text-brand-500 dark:text-brand-400 text-lg font-medium">{{ pedido.email }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Teléfono</p>
                <p class="text-gray-700 dark:text-gray-200 text-lg">{{ pedido.telefono || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Dirección</p>
                <p class="text-gray-700 dark:text-gray-200 text-lg">{{ pedido.direccion }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Ciudad</p>
                <p class="text-gray-700 dark:text-gray-200 text-lg">{{ pedido.ciudad }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Estado</p>
                <p class="text-gray-700 dark:text-gray-200 text-lg">{{ pedido.estado }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Código Postal</p>
                <p class="text-gray-700 dark:text-gray-200 text-lg">{{ pedido.codigo_postal }}</p>
              </div>
            </div>

            <!-- Selector de Estado -->
            <div class="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
              <label class="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-3">Cambiar Estado del Pedido</label>
              <div class="flex items-center gap-4">
                <select 
                  v-model="newStatus" 
                  class="w-full max-w-xs rounded-lg border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white px-4 py-2.5 focus:border-brand-500 focus:ring-brand-500 shadow-sm"
                >
                  <option value="approved">En Proceso</option>
                  <option value="completed">Completado</option>
                  <option value="rejected">Fallido</option>
                </select>
                <button 
                  @click="updateStatus" 
                  :disabled="updating"
                  class="bg-brand-500 hover:bg-brand-600 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-bold transition shadow-sm flex items-center gap-2"
                >
                  <span v-if="updating">Actualizando...</span>
                  <span v-else>Guardar Estado</span>
                </button>
              </div>
              <p v-if="successMsg" class="mt-2 text-success-600 text-sm font-medium">{{ successMsg }}</p>
            </div>
          </div>
        </div>

        <!-- Columna Derecha (1/3): Sumario del pedido -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm sticky top-8">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 class="font-bold text-gray-800 dark:text-white/90">Sumario del Pedido</h3>
            </div>
            
            <div class="p-6">
              <div class="divide-y divide-gray-100 dark:divide-gray-800">
                <div v-for="item in pedido.carrito" :key="item.id" class="py-4 flex gap-3 items-start first:pt-0">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ item.name }}</h4>
                    <p class="text-gray-500 text-xs mt-0.5">x{{ item.quantity }} unidades</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-gray-800 dark:text-white/90 text-sm">
                      ${{ (item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-900/50 p-6 space-y-4">
               <div class="flex justify-between text-sm text-gray-500">
                 <span>Subtotal</span>
                 <span class="text-gray-800 dark:text-white">${{ (pedido.total_pedido - (pedido.envio_costo || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
               </div>
               <div class="flex justify-between text-sm text-gray-500">
                 <span>Envío</span>
                 <span class="text-gray-800 dark:text-white">{{ pedido.envio_costo > 0 ? '$' + pedido.envio_costo.toLocaleString('es-MX') : '$0.00' }}</span>
               </div>
               <div class="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700 text-xl font-black text-gray-900 dark:text-white">
                 <span>TOTAL</span>
                 <span class="text-brand-500">${{ Number(pedido.total_pedido).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
               </div>
            </div>

            <!-- ID Pago -->
            <div class="p-6 border-t border-gray-100 dark:border-gray-800 text-center">
              <p class="text-xs text-gray-400 uppercase font-bold mb-1">Referencia Mercado Pago</p>
              <p class="font-mono text-gray-500 text-xs">{{ pedido.mp_payment_id || 'SIN REFERENCIA' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { fetchWithAuth } from '../../services/api'

interface PedidoItem {
  id: number
  name: string
  quantity: number
  price: number
}

interface Pedido {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  estado: string
  codigo_postal: string
  total_pedido: number
  envio_costo: number
  mp_status: string
  mp_payment_id: string
  fecha_compra: string
  carrito: PedidoItem[]
}

const route = useRoute()
const pedido = ref<Pedido | null>(null)
const loading = ref(true)
const updating = ref(false)
const error = ref('')
const successMsg = ref('')
const newStatus = ref('approved')

const statusLabel = (status: string) => {
  if (status === 'approved' || status === 'in_process') return 'En proceso'
  if (status === 'completed') return 'Completado'
  return 'Fallido'
}

const statusColor = (status: string) => {
  if (status === 'approved' || status === 'in_process') return 'bg-success-50 text-success-700 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20'
  if (status === 'completed') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
  return 'bg-error-50 text-error-700 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20'
}

const fetchPedido = async () => {
  loading.value = true
  try {
    const res = await fetchWithAuth(`/api/admin/clientes/${route.params.id}`)
    if (!res.ok) throw new Error('No se encontró el pedido')
    const data = await res.json()
    pedido.value = data
    newStatus.value = data.mp_status
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

const updateStatus = async () => {
  if (!pedido.value) return
  updating.value = true
  successMsg.value = ''
  try {
    const res = await fetchWithAuth(`/api/admin/clientes/${pedido.value.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus.value })
    })
    if (!res.ok) throw new Error('Error al actualizar el estado')
    
    pedido.value.mp_status = newStatus.value
    successMsg.value = 'Estado actualizado correctamente'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err: any) {
    alert(err.message)
  } finally {
    updating.value = false
  }
}

onMounted(fetchPedido)
</script>
