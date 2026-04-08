<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const pedidos = ref([])
const loadingPedidos = ref(true)
const tab = ref('pedidos') // 'pedidos' | 'perfil'

const selectedPedido = ref(null)

function abrirDetalles(pedido) {
  selectedPedido.value = pedido
}

function cerrarDetalles() {
  selectedPedido.value = null
}

// Estado del mapa de estados WooCommerce
const estadoLabel = {
  pending: 'Pendiente',
  processing: 'En proceso',
  'on-hold': 'En espera',
  completed: 'Completado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  failed: 'Fallido',
}

const estadoColor = {
  completed: '#16a34a',
  processing: '#2563eb',
  pending: '#d97706',
  cancelled: '#dc2626',
  refunded: '#7c3aed',
  'on-hold': '#6b7280',
  failed: '#dc2626',
}

onMounted(async () => {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  try {
    pedidos.value = await auth.fetchPedidos()
  } finally {
    loadingPedidos.value = false
  }
})

function handleLogout() {
  auth.logout()
  router.push('/')
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="account-wrapper">
    <div class="container">
      <!-- Header de cuenta -->
      <div class="account-header">
        <div class="account-avatar">
          {{ auth.cliente?.nombre?.charAt(0)?.toUpperCase() }}
        </div>
        <div class="account-info">
          <h1>{{ auth.cliente?.nombre }} {{ auth.cliente?.apellido }}</h1>
          <p>{{ auth.cliente?.email }}</p>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Cerrar sesión
        </button>
      </div>

      <!-- Tabs -->
      <div class="account-tabs">
        <button :class="['tab-btn', { active: tab === 'pedidos' }]" @click="tab = 'pedidos'">
          Mis pedidos
        </button>
        <button :class="['tab-btn', { active: tab === 'perfil' }]" @click="tab = 'perfil'">
          Mi perfil
        </button>
      </div>

      <!-- Pedidos -->
      <div v-if="tab === 'pedidos'" class="tab-content">
        <div v-if="loadingPedidos" class="loading-state">Cargando tus pedidos...</div>

        <div v-else-if="pedidos.length === 0" class="empty-orders">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <p>Aún no tienes pedidos</p>
          <RouterLink to="/shop" class="shop-link">Explorar tienda</RouterLink>
        </div>

        <div v-else class="orders-list">
          <div v-for="pedido in pedidos" :key="pedido.id" class="order-card">
            <div class="order-header">
              <div>
                <span class="order-number">#{{ pedido.numero }}</span>
                <span class="order-date">{{ formatFecha(pedido.fecha) }}</span>
              </div>
              <span class="order-status" :style="{ color: estadoColor[pedido.estado] || '#6b7280', background: (estadoColor[pedido.estado] || '#6b7280') + '18' }">
                {{ estadoLabel[pedido.estado] || pedido.estado }}
              </span>
            </div>

            <div class="order-items">
              <div v-for="item in pedido.productos" :key="item.nombre" class="order-item">
                <span class="item-name">{{ item.nombre }}</span>
                <span class="item-qty">× {{ item.cantidad }}</span>
              </div>
            </div>

            <div class="order-footer">
              <button class="details-link" @click="abrirDetalles(pedido)">Ver Detalles</button>
              <span class="order-total">Total: <strong>{{ pedido.total }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Detalles del Pedido -->
      <div v-if="selectedPedido" class="modal-overlay" @click.self="cerrarDetalles">
        <div class="modal-content">
          <button class="modal-close" @click="cerrarDetalles">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <h2>Detalles del Pedido #{{ selectedPedido.numero }}</h2>
          <p class="modal-date">{{ formatFecha(selectedPedido.fecha) }}</p>

          <div class="modal-section">
            <h3>Dirección de entrega</h3>
            <p>{{ selectedPedido.direccion_envio }}</p>
          </div>

          <div class="modal-section">
            <h3>Productos</h3>
            <ul class="modal-products">
              <li v-for="item in selectedPedido.productos" :key="item.nombre">
                <span class="product-name">{{ item.cantidad }}x {{ item.nombre }}</span>
                <span class="product-price">{{ item.subtotal }}</span>
              </li>
            </ul>
          </div>

          <div class="modal-summary">
            <div class="summary-line">
              <span>Costo de envío</span>
              <span>{{ selectedPedido.envio }}</span>
            </div>
            <div class="summary-line total">
              <span>Total pagado</span>
              <span>{{ selectedPedido.total }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Perfil -->
      <div v-if="tab === 'perfil'" class="tab-content profile-section">
        <div class="profile-grid">
          <div class="profile-item">
            <label>Nombre</label>
            <p>{{ auth.cliente?.nombre }}</p>
          </div>
          <div class="profile-item">
            <label>Apellido</label>
            <p>{{ auth.cliente?.apellido || '—' }}</p>
          </div>
          <div class="profile-item">
            <label>Correo electrónico</label>
            <p>{{ auth.cliente?.email }}</p>
          </div>
          <div class="profile-item">
            <label>Teléfono</label>
            <p>{{ auth.cliente?.telefono || '—' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-wrapper {
  min-height: 100vh;
  background: #f9fafb;
  padding: 3rem 0 5rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.account-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.account-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a6837, #16a34a);
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.account-info {
  flex: 1;
}

.account-info h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.account-info p {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #fef2f2;
  color: #dc2626;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Poppins', sans-serif;
}

.logout-btn:hover { background: #fee2e2; }

/* Tabs */
.account-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.6rem 1.5rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--color-brand, #0a6837);
  border-color: var(--color-brand, #0a6837);
  color: white;
}

/* Tab content */
.tab-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Empty */
.empty-orders {
  text-align: center;
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-orders p { color: #9ca3af; font-size: 1.1rem; }

.shop-link {
  background: var(--color-brand, #0a6837);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Orders */
.orders-list { display: flex; flex-direction: column; gap: 1rem; }

.order-card {
  border: 1.5px solid #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.order-number {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #111827;
  margin-right: 0.75rem;
}

.order-date { color: #6b7280; font-size: 0.875rem; }

.order-status {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.order-items { padding: 0.75rem 1.25rem; }

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: #374151;
}

.item-qty { color: #9ca3af; }

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.95rem;
  color: #374151;
}

.details-link {
  background: none;
  border: none;
  color: #0a6837;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 0;
}

.details-link:hover {
  color: #16a34a;
}

/* Perfil */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.profile-item label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  display: block;
  margin-bottom: 0.3rem;
}

.profile-item p {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
  margin: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #111827;
}

.modal-content h2 {
  font-family: 'Poppins', sans-serif;
  margin: 0 0 0.25rem 0;
  font-size: 1.35rem;
  color: #111827;
}

.modal-date {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}

.modal-section {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1.5rem;
}

.modal-section h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.modal-section p {
  color: #4b5563;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal-products {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modal-products li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #374151;
}

.product-name {
  flex: 1;
  padding-right: 1rem;
}

.product-price {
  font-weight: 500;
  white-space: nowrap;
}

.modal-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #4b5563;
}

.summary-line.total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 600px) {
  .account-header { flex-wrap: wrap; }
  .profile-grid { grid-template-columns: 1fr; }
}
</style>
