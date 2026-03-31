<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { fetchAllProducts, fetchCategories, fetchColors } from '@/services/api'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

const products = ref([])
const categories = ref([])
const colors = ref([])

const loading = ref(true)

// Filtros seleccionados
const selectedCategory = ref('')
const selectedColor = ref('')

const loadData = async () => {
  loading.value = true
  
  try {
    // Solo cargamos categorías y colores la primera vez
    if (categories.value.length === 0) {
      const cats = await fetchCategories()
      categories.value = cats.filter(c => c.count > 0) // solo mostrar con productos
    }
    
    if (colors.value.length === 0) {
      const attrs = await fetchColors()
      colors.value = attrs.terms || []
    }

    // Cargar productos con los filtros actuales
    const params = {}
    if (selectedCategory.value) params.category = selectedCategory.value
    if (selectedColor.value) {
      // asumimos que el attribute slug que devuelve WooCommerce para color es uno de estos
      // Si la API falla al filtrar esto, tendríamos que filtrarlo en local
      params.attribute = 'pa_color' 
      params.attribute_term = selectedColor.value
    }

    products.value = await fetchAllProducts(params)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const itemsPerPage = 12
const currentPage = ref(1)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return products.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage))

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Volver a cargar si cambia algún filtro
watch([selectedCategory, selectedColor], () => {
  currentPage.value = 1
  loadData()
})

</script>

<template>
  <div class="shop-wrapper">
    <!-- Header simple -->
    <header class="shop-header">
      <div class="container">
        <h1>Tienda Completa</h1>
        <p>Explora todos nuestros productos y encuentra lo que necesitas.</p>
      </div>
    </header>

    <div class="container shop-layout">
      <!-- Sidebar de Filtros -->
      <aside class="shop-sidebar">
        <div class="filter-group">
          <h3>Categorías</h3>
          <ul class="filter-list">
            <li>
              <label>
                <input type="radio" v-model="selectedCategory" value="" />
                Todas las categorías
              </label>
            </li>
            <li v-for="cat in categories" :key="cat.id">
              <label>
                <input type="radio" v-model="selectedCategory" :value="cat.id" />
                {{ cat.name }} ({{ cat.count }})
              </label>
            </li>
          </ul>
        </div>

        <div class="filter-group" v-if="colors.length > 0">
          <h3>Color</h3>
          <ul class="filter-list">
            <li>
              <label>
                <input type="radio" v-model="selectedColor" value="" />
                Todos los colores
              </label>
            </li>
            <li v-for="color in colors" :key="color.id">
              <label>
                <input type="radio" v-model="selectedColor" :value="color.term_id" />
                {{ color.name }}
              </label>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Grid de Productos -->
      <main class="shop-content">
        <div v-if="loading" class="loading-state">
          Cargando productos...
        </div>
        
        <div v-else-if="products.length === 0" class="empty-state">
          <p>No se encontraron productos para los filtros seleccionados.</p>
          <button @click="selectedCategory = ''; selectedColor = ''" class="reset-btn">Limpiar filtros</button>
        </div>
        
        <div v-else>
          <div class="product-grid">
            <div v-for="(product, index) in paginatedProducts" :key="product.id || index" class="product-card">
            <RouterLink :to="`/producto/${product.id}`" class="product-image-wrapper">
              <img v-if="product.image" :src="product.image" :alt="product.name" class="product-real-img" />
              <div v-else class="product-image-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div v-if="product.badge" class="product-badge">{{ product.badge }}</div>
            </RouterLink>
            
            <div class="product-info">
              <h4 class="product-name">
                <RouterLink :to="`/producto/${product.id}`" class="name-link">
                  {{ product.name }}
                </RouterLink>
              </h4>
              <div class="product-price">
                <span v-if="product.compareAtPriceFormatted || product.compareAtPrice" class="compare-price">
                  {{ product.compareAtPriceFormatted || product.compareAtPrice }}
                </span>
                <span class="current-price">
                  {{ product.priceFormatted || product.price }}
                </span>
              </div>
              <button class="add-to-cart-btn" @click="cart.addToCart(product)">Agregar al Carrito</button>
            </div>
          </div>
          </div>

          <!-- Navegación de Paginación -->
          <div v-if="totalPages > 1" class="pagination-wrapper">
            <button 
              class="page-btn nav-btn" 
              :disabled="currentPage === 1" 
              @click="goToPage(currentPage - 1)"
            >
              Anterior
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in totalPages" 
                :key="page"
                class="page-btn"
                :class="{ 'active': currentPage === page }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>

            <button 
              class="page-btn nav-btn" 
              :disabled="currentPage === totalPages" 
              @click="goToPage(currentPage + 1)"
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shop-wrapper {
  background-color: #f9fafb;
  min-height: 100vh;
  padding-bottom: 5rem;
}

.shop-header {
  background-color: #ffffff;
  padding: 4rem 0;
  border-bottom: 1px solid #ebebeb;
  text-align: center;
  margin-bottom: 3rem;
}

.shop-header h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.shop-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.shop-layout {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

/* Sidebar */
.shop-sidebar {
  width: 250px;
  flex-shrink: 0;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #ebebeb;
}

.filter-group {
  margin-bottom: 2rem;
}

.filter-group h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.5rem;
}

.filter-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.filter-list li {
  margin-bottom: 0.5rem;
}

.filter-list label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #4b5563;
  cursor: pointer;
  transition: color 0.2s;
}

.filter-list label:hover {
  color: var(--color-brand, #0a6837);
}

/* Content */
.shop-content {
  flex: 1;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 5rem 0;
  color: #6b7280;
  font-size: 1.1rem;
}

.reset-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-brand, #0a6837);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Rejilla 3 columnas */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

/* Mismos estilos de tarjeta que en ProductGrid */
.product-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #f3f4f6;
  height: 100%;
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
  display: block;
}

.product-real-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #fff;
  transition: transform 0.4s ease;
}

.product-card:hover .product-real-img {
  transform: scale(1.05);
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.name-link {
  text-decoration: none;
  color: #1f2937;
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

/* Responsividad */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .shop-layout {
    flex-direction: column;
  }
  .shop-sidebar {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

/* Styles para paginación */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-brand, #0a6837);
  color: var(--color-brand, #0a6837);
  background: #f0fdf4;
}

.page-btn.active {
  background: var(--color-brand, #0a6837);
  color: white;
  border-color: var(--color-brand, #0a6837);
}

.page-btn.nav-btn {
  width: auto;
  padding: 0 1rem;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6;
}
</style>
