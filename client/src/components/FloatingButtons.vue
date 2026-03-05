<script setup>
import { ref } from 'vue'
import CartDrawer from './CartDrawer.vue'

const isCartOpen = ref(false)

const openCart = () => {
  isCartOpen.value = true
}

const closeCart = () => {
  isCartOpen.value = false
}
</script>

<template>
  <!-- Botones flotantes izquierda -->
  <div class="fab-left">
    <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" class="fab-pill fab-whatsapp" aria-label="WhatsApp">
      <!-- Ícono bocadillo de chat -->
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.428a.5.5 0 0 0 .624.603l5.747-1.505A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.645-.52-5.148-1.422l-.37-.22-3.41.894.91-3.319-.24-.38A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      <span>WhatsApp</span>
    </a>

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
  <button class="fab-cart" aria-label="Carrito de compras" @click="openCart">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="21" r="1"/>
      <circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
    <span class="cart-badge">1</span>
  </button>

  <!-- Drawer (Slide-in) -->
  <CartDrawer :is-open="isCartOpen" @close="closeCart" />
</template>

<style scoped>
/* ─── Contenedor izquierdo ──────────────────────────────────────────── */
.fab-left {
  position: fixed;
  left: 1.5rem;
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

.fab-whatsapp {
  background-color: #25D366;
  color: #ffffff;
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
    left: 1rem;
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
