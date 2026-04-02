<template>
  <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
    <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Últimos Pedidos</h3>
      </div>
      <router-link to="/admin/pedidos" class="text-brand-500 hover:text-brand-600 text-sm font-medium">
        Ver todos
      </router-link>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-t border-gray-100 dark:border-gray-800">
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">#Pedido</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Cliente</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Total</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Estado</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="pedido in pedidos"
            :key="pedido.id"
            class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer"
            @click="$router.push(`/admin/pedidos/${pedido.id}`)"
          >
            <td class="py-3 whitespace-nowrap">
              <span class="font-bold text-gray-800 text-theme-sm dark:text-white/90">#{{ String(pedido.id).padStart(5, '0') }}</span>
            </td>
            <td class="py-3 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-xs uppercase flex-shrink-0">
                  {{ (pedido.nombre || 'U').charAt(0) }}
                </div>
                <span class="text-theme-sm text-gray-800 dark:text-white/90">{{ pedido.nombre }}</span>
              </div>
            </td>
            <td class="py-3 whitespace-nowrap">
              <p class="text-theme-sm text-gray-800 dark:text-white/90 font-semibold">${{ Number(pedido.total_pedido).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <span :class="[
                'rounded-full px-2 py-0.5 text-[10px] font-medium border uppercase tracking-wider',
                statusColor(pedido.mp_status)
              ]">
                {{ statusLabel(pedido.mp_status) }}
              </span>
            </td>
          </tr>
          <tr v-if="pedidos.length === 0">
            <td colspan="4" class="py-10 text-center text-gray-400 text-sm italic">No hay pedidos recientes.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pedidos = ref([])

const statusLabel = (status) => {
  if (status === 'approved' || status === 'in_process') return 'En proceso'
  if (status === 'completed') return 'Completado'
  return 'Fallido'
}

const statusColor = (status) => {
  if (status === 'approved' || status === 'in_process') return 'bg-success-50 text-success-700 border-success-100'
  if (status === 'completed') return 'bg-blue-50 text-blue-700 border-blue-100'
  return 'bg-error-50 text-error-700 border-error-100'
}

const fetchRecentOrders = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/admin/pedidos?limit=5')
    if (res.ok) {
      const json = await res.json()
      pedidos.value = json.data
    }
  } catch (error) {
    console.error('Error fetching recent orders:', error)
  }
}

onMounted(fetchRecentOrders)
</script>
