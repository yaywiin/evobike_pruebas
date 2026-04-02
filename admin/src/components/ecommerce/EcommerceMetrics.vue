<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
    <!-- Customers Card -->
    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-500/20">
        <svg class="fill-brand-600 dark:fill-brand-400" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <div class="mt-5 flex items-end justify-between">
        <div>
          <span class="text-sm text-gray-500 dark:text-gray-400">Clientes Únicos</span>
          <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {{ stats.customers.toLocaleString() }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Orders Card -->
    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-500/20">
        <svg class="fill-blue-600 dark:fill-blue-400" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      </div>
      <div class="mt-5 flex items-end justify-between">
        <div>
          <span class="text-sm text-gray-500 dark:text-gray-400">Pedidos Totales</span>
          <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {{ stats.orders.toLocaleString() }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Products Card -->
    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-500/20">
        <svg class="fill-orange-600 dark:fill-orange-400" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
        </svg>
      </div>
      <div class="mt-5 flex items-end justify-between">
        <div>
          <span class="text-sm text-gray-500 dark:text-gray-400">Productos Activos</span>
          <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {{ stats.products.toLocaleString() }}
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  customers: 0,
  orders: 0,
  products: 0
})

const fetchStats = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/admin/stats')
    if (res.ok) {
      stats.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }
}

onMounted(fetchStats)
</script>
