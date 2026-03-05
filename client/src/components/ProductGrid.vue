<script setup>
const props = defineProps({
  title: String,
  subtitle: String,
  viewAllLink: String,
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <section class="store-section">
    <div class="container">
      <div class="section-header">
        <div class="header-titles">
          <h2 class="subtitle">{{ subtitle }}</h2>
          <h3 class="title">{{ title }}</h3>
        </div>
        <a v-if="viewAllLink" :href="viewAllLink" class="view-all">Ver todo <span class="arrow">&rarr;</span></a>
      </div>

      <!-- Skeleton Loading State -->
      <div v-if="loading" class="product-grid">
        <div v-for="i in 4" :key="`skel-${i}`" class="product-card skeleton-card">
          <div class="product-image-wrapper skeleton-img"></div>
          <div class="product-info">
            <div class="skeleton-text skeleton-title"></div>
            <div class="skeleton-text skeleton-price"></div>
            <div class="skeleton-btn"></div>
          </div>
        </div>
      </div>

      <!-- Real Products -->
      <div v-else class="product-grid">
        <div v-for="(product, index) in products" :key="index" class="product-card">
          <div class="product-image-wrapper">
            <!-- Si el servidor envía la imagen real, la mostramos. Si no, mostramos placeholder -->
            <img v-if="product.image" :src="product.image" :alt="product.name" class="product-real-img" />
            <div v-else class="product-image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            
            <div v-if="product.badge" class="product-badge">{{ product.badge }}</div>
          </div>
          
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price">
              <span v-if="product.compareAtPrice" class="compare-price">{{ product.compareAtPrice }}</span>
              <span class="current-price">{{ product.price }}</span>
            </div>
            <button class="add-to-cart-btn">Agregar al Carrito</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.store-section {
  padding: 5rem 0;
  background-color: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ── Encabezado de la sección ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  border-bottom: 1px solid #ebebeb;
  padding-bottom: 1rem;
}

.header-titles {
  display: flex;
  flex-direction: column;
}

.subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-brand, #0a6837); /* Color brand principal */
  letter-spacing: 0.1em;
  margin: 0 0 0.25rem 0;
}

.title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.1;
}

.view-all {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4b5563;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s ease;
  padding-bottom: 0.25rem;
}

.view-all:hover {
  color: var(--color-brand, #0a6837);
}

.arrow {
  transition: transform 0.2s ease;
}

.view-all:hover .arrow {
  transform: translateX(4px);
}

/* ── Grid de Productos ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

/* ── Tarjeta de Producto ── */
.product-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #f3f4f6;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.product-image-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  background-color: #f9fafb;
  overflow: hidden;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
}

.product-real-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Para que la bicicleta se vea completa sin cortarse */
  background-color: #fff; /* En caso de que sea PNG transparente */
  transition: transform 0.4s ease;
}

.product-card:hover .product-real-img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: var(--color-brand, #0a6837);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.product-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.current-price {
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-brand, #0a6837);
}

.compare-price {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: #9ca3af;
  text-decoration: line-through;
}

.add-to-cart-btn {
  margin-top: auto;
  width: 100%;
  padding: 0.75rem;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-card:hover .add-to-cart-btn {
  background-color: var(--color-brand, #0a6837);
  color: #ffffff;
}

/* ── Skeleton Loading ── */
.skeleton-card {
  pointer-events: none;
}

.skeleton-img {
  background-color: #e5e7eb;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-text {
  background-color: #e5e7eb;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-title {
  height: 1.2rem;
  width: 80%;
  margin-bottom: 0.8rem;
}

.skeleton-price {
  height: 1.2rem;
  width: 50%;
  margin-bottom: 1.5rem;
}

.skeleton-btn {
  height: 48px;
  width: 100%;
  border-radius: 8px;
  background-color: #e5e7eb;
  margin-top: auto;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
