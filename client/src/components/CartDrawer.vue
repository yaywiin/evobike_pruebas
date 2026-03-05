<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// Mock de ítems en carrito (más adelante conectaremos a un manejador de estado real como Pinia)
const cartItems = [
  {
    id: 1,
    name: 'Aguila Pro',
    price: 24990,
    quantity: 1,
    image: null
  }
]

const subtotal = computed(() => {
  return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
})

const formatPrice = (price) => {
  return `$ ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

const closeCart = () => {
  emit('close')
}
</script>

<template>
  <div class="cart-drawer-container">
    <!-- Overlay oscuro -->
    <div 
      class="cart-overlay" 
      :class="{ 'is-open': isOpen }" 
      @click="closeCart"
    ></div>

    <!-- Drawer lateral -->
    <div 
      class="cart-drawer" 
      :class="{ 'is-open': isOpen }"
    >
      <div class="cart-header">
        <h2 class="cart-title">Tu Carrito</h2>
        <button class="close-btn" @click="closeCart" aria-label="Cerrar carrito">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="cart-content">
        <!-- Si está vacío -->
        <div v-if="cartItems.length === 0" class="empty-cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <p>Tu carrito está vacío</p>
          <button class="btn-continue" @click="closeCart">Continuar comprando</button>
        </div>

        <!-- Lista de ítems -->
        <div v-else class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-img-wrapper">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="item-img" />
              <!-- Placeholder img -->
              <div v-else class="item-img-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </div>
            
            <div class="item-details">
              <h4 class="item-name">{{ item.name }}</h4>
              <p class="item-price">{{ formatPrice(item.price) }}</p>
              
              <div class="item-controls">
                <div class="qty-selector">
                  <button class="qty-btn" aria-label="Disminuir cantidad">-</button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button class="qty-btn" aria-label="Aumentar cantidad">+</button>
                </div>
                <button class="remove-btn" aria-label="Eliminar producto">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del carrito con totales -->
      <div v-if="cartItems.length > 0" class="cart-footer">
        <div class="cart-subtotal">
          <span class="subtotal-label">Subtotal</span>
          <span class="subtotal-amount">{{ formatPrice(subtotal) }}</span>
        </div>
        <p class="shipping-note">Los impuestos y gastos de envío se calculan en la pantalla de pago.</p>
        <button class="btn-checkout">Proceder al pago</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Overlay oscuro ── */
.cart-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.cart-overlay.is-open {
  opacity: 1;
  visibility: visible;
}

/* ── Panel lateral (Drawer) ── */
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  background-color: #ffffff;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  font-family: 'Poppins', sans-serif;
}

.cart-drawer.is-open {
  transform: translateX(0);
}

/* ── Header del drawer ── */
.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #ebebeb;
}

.cart-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

/* ── Contenido ── */
.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Estado vacío */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
}

.empty-cart p {
  font-size: 1.1rem;
  margin: 1.5rem 0;
}

.btn-continue {
  background-color: var(--color-brand, #0a6837);
  color: #ffffff;
  border: none;
  padding: 0.85rem 2rem;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-continue:hover {
  background-color: var(--color-brand-dark, #028016);
}

/* Lista de ítems */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
}

.item-img-wrapper {
  width: 80px;
  height: 80px;
  background-color: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ebebeb;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-img-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.item-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-brand, #0a6837);
  margin: 0 0 0.75rem 0;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.qty-selector {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  height: 32px;
}

.qty-btn {
  background-color: #f9fafb;
  border: none;
  width: 32px;
  height: 100%;
  font-size: 1.1rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s;
}

.qty-btn:hover {
  background-color: #e5e7eb;
}

.qty-value {
  width: 32px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
  padding: 0;
}

.remove-btn:hover {
  color: #ef4444; /* Rojo para eliminar */
}

/* ── Footer del carrito ── */
.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid #ebebeb;
  background-color: #f9fafb;
}

.cart-subtotal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.subtotal-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.subtotal-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.shipping-note {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 1.25rem 0;
  line-height: 1.4;
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  background-color: var(--color-brand, #0a6837);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-checkout:hover {
  background-color: var(--color-brand-dark, #028016);
  transform: translateY(-2px);
}
</style>
