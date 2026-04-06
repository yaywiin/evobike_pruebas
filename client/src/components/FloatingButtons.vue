<script setup>
import CartDrawer from './CartDrawer.vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <!-- Botones flotantes izquierda -->
  <div class="fab-left">
    <!-- Email button -->
    <a href="mailto:ventas@evobike.mx" class="fab-pill fab-email" aria-label="Email">
      <!-- Ícono envelope -->
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
      <span>Email</span>
    </a>
  </div>

  <!-- Botón flotante derecha: Carrito -->
  <button class="fab-cart" aria-label="Carrito de compras" @click="cart.openCart()">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="21" r="1"/>
      <circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
    <span v-if="cart.totalItems > 0" class="cart-badge">{{ cart.totalItems }}</span>
  </button>

  <!-- Drawer (Slide-in) -->
  <CartDrawer :is-open="cart.isCartOpen" @close="cart.closeCart()" />
</template>

<style scoped>
/* ─── Contenedor izquierdo ──────────────────────────────────────────── */
.fab-left {
  position: fixed;
  left: 6.5rem;
  bottom: 2.5rem;
  display: flex;
  flex-direction: row;
  gap: 0.6rem;
  z-index: 999;
  align-items: center;
}

/* ─── Pills ─────────────────────────────────────────────────────────── */
.fab-pill {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0 1.1rem;
  height: 48px;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fab-pill:hover {
  transform: translateX(4px) scale(1.03);
  box-shadow: 0 6px 20px rgba(0,0,0,0.22);
}


.fab-email {
  background-color: #1a69c4;
  color: #ffffff;
}

.fab-pill span {
  white-space: nowrap;
}

/* ─── Botón carrito derecha ─────────────────────────────────────────── */
.fab-cart {
  position: fixed;
  right: 1.5rem;
  bottom: 2.5rem;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background-color: #09AC22;
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 999;
}

.fab-cart:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 22px rgba(0,0,0,0.25);
}

/* Badge contador */
.cart-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: #ffffff;
  color: #09AC22;
  font-family: 'Poppins', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
/* ─── Responsive móvil ───────────────────────────────────────────── */
@media (max-width: 768px) {
  .fab-left {
    left: 5rem;
    bottom: 1.5rem;
    gap: 0.5rem;
  }

  /* Ocultar texto, mostrar solo icono */
  .fab-pill span { display: none; }

  .fab-pill {
    width: 46px;
    height: 46px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
  }

  .fab-cart {
    right: 1rem;
    bottom: 1.5rem;
    width: 50px;
    height: 50px;
  }
}
</style>
