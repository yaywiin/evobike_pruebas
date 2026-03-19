<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import ProductGrid from '@/components/ProductGrid.vue'

const route = useRoute()
const cart = useCartStore()

const product = ref(null)
const loading = ref(true)
const recommendedProducts = ref([])

// Control de cantidad
const quantity = ref(1)
const mainImage = ref(null)

const fetchProduct = async (id) => {
  loading.value = true
  try {
    const res = await fetch(`http://localhost:3001/api/products/${id}`)
    if (!res.ok) throw new Error('Error al cargar el producto')
    
    product.value = await res.json()
    mainImage.value = product.value.image
    
    // Si la foto está en la galería, usamos la primera
    if (!mainImage.value && product.value.images && product.value.images.length > 0) {
      mainImage.value = product.value.images[0].src
    }
    
    quantity.value = 1
    fetchRecommended()
  } catch (err) {
    console.error(err)
    product.value = null
  } finally {
    loading.value = false
  }
}

const fetchRecommended = async () => {
  try {
    const res = await fetch(`http://localhost:3001/api/products/random?limit=5`)
    if (res.ok) {
      const data = await res.json()
      // Filtramos para evitar mostrar el producto actual, limitamos a 4
      recommendedProducts.value = data
        .filter(p => String(p.id) !== String(product.value?.id))
        .slice(0, 4)
    }
  } catch (err) {
    console.error(err)
  }
}

// Para cuando el usuario navegue desde el header *estando ya* en un producto
watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchProduct(newId)
  }
)

onMounted(() => {
  fetchProduct(route.params.id)
})

const increaseQty = () => { quantity.value++ }
const decreaseQty = () => { if (quantity.value > 1) quantity.value-- }

// Estado para las variaciones seleccionadas
const selectedAttributes = ref({})

const selectAttribute = (attrName, option) => {
  selectedAttributes.value[attrName] = option

  // Buscar si hay una variación que coincida con los atributos seleccionados
  if (product.value && product.value.variations && product.value.variations.length > 0) {
    const matchedVariation = product.value.variations.find(v => {
      // Checar que todas las llaves seleccionadas hagan match
      return Object.keys(selectedAttributes.value).every(key => {
        const selectedVal = selectedAttributes.value[key]
        // v.attributes es de la forma: { id: 1, name: 'Color', option: 'Rojo/Verde' }
        // Se hace case-insensitive comparison por si WooCommerce lo manda diferente
        const vAttr = v.attributes.find(a => a.name.toLowerCase() === key.toLowerCase())
        return vAttr && vAttr.option === selectedVal
      })
    })

    if (matchedVariation && matchedVariation.image) {
      mainImage.value = matchedVariation.image
    }
  }
}

// Función para mapear nombres de colores a códigos HEX reales (o gradientes si son mixtos)
const getColorMap = (colorName) => {
  // Lista de colores base
  const colorsBase = {
    'rojo': '#ef4444',
    'azul': '#3b82f6',
    'negro': '#111827',
    'blanco': '#ffffff',
    'gris': '#9ca3af',
    'verde': '#10b981',
    'amarillo': '#eab308',
    'naranja': '#f97316',
    'rosa': '#ec4899',
    'morado': '#a855f7',
    'cafe': '#713f12',
    'celeste': '#38bdf8'
  }
  
  // Limpiamos el texto
  const rawColor = colorName.toLowerCase()
  
  // Si encontramos un separador (ej. "Negro/Rojo" o "Negro - Rojo")
  const splitChars = ['/', '-', ' y ']
  let separated = null
  for (const char of splitChars) {
    if (rawColor.includes(char)) {
      separated = rawColor.split(char).map(s => s.trim())
      break
    }
  }

  if (separated && separated.length === 2) {
    const c1 = colorsBase[separated[0]] || '#cccccc'
    const c2 = colorsBase[separated[1]] || '#cccccc'
    // Retornamos un gradient que divida en diagonal
    return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`
  }
  
  // Color de un solo tono
  return colorsBase[rawColor] || '#cccccc'
}

const handleAddToCart = () => {
  if (!product.value) return
  
  // Agregar al carrito enviando también las variaciones seleccionadas
  const productToAdd = {
    ...product.value,
    selectedOptions: selectedAttributes.value
  }

  for (let i = 0; i < quantity.value; i++) {
    cart.addToCart(productToAdd)
  }
}
</script>

<template>
  <div class="product-page">
    <div class="container" v-if="loading">
      <div class="skeleton-view">
        <div class="skeleton-img"></div>
        <div class="skeleton-details">
          <div class="skeleton-title"></div>
          <div class="skeleton-price"></div>
          <div class="skeleton-desc"></div>
        </div>
      </div>
    </div>
    
    <div class="container" v-else-if="product">
      <div class="product-view">
        <!-- Columna Izquierda: Galería -->
        <div class="product-gallery-container">
          <!-- Imagen Principal -->
          <div class="main-image-box">
            <img v-if="mainImage" :src="mainImage" :alt="product.name" class="main-img" />
            <div v-else class="placeholder-img">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          </div>
          
          <!-- Miniaturas (si tiene más de 1 imagen) -->
          <div class="thumbnail-list" v-if="product.images && product.images.length > 1">
            <button 
              v-for="img in product.images" 
              :key="img.id" 
              class="thumb-btn"
              :class="{ 'active': mainImage === img.src }"
              @click="mainImage = img.src"
            >
              <img :src="img.src" :alt="img.alt || product.name" />
            </button>
          </div>
        </div>

        <!-- Columna Derecha: Detalles de Compra -->
        <div class="product-details">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price-section">
            <span class="price-current">{{ product.priceFormatted }}</span>
          </div>
          
          <!-- Controles de Variación -->
          <div class="product-variations" v-if="product.attributes && product.attributes.length > 0">
            <div class="variation-group" v-for="attr in product.attributes" :key="attr.id">
              <label>{{ attr.name }} <span class="selected-label" v-if="selectedAttributes[attr.name]">— {{ selectedAttributes[attr.name] }}</span></label>
              
              <!-- Si el atributo se llama Color pintamos cuadritos divididos con estilo real de color -->
              <div class="swatches-container" v-if="attr.name.toLowerCase() === 'color'">
                <button 
                  v-for="opt in attr.options" 
                  :key="opt" 
                  class="color-swatch"
                  :class="{ 'is-selected': selectedAttributes[attr.name] === opt }"
                  @click="selectAttribute(attr.name, opt)"
                  :aria-label="'Color ' + opt"
                >
                  <!-- El color visual (mitad 1) / (mitad 2 o el mismo) -->
                  <span class="color-fill" :style="{ background: getColorMap(opt) }"></span>
                </button>
              </div>

              <!-- Para el resto de atributos (voltaje, talla, etc) pintamos bloques de texto interactivos (cuadritos) -->
              <div class="swatches-container" v-else>
                <button 
                  v-for="opt in attr.options" 
                  :key="opt" 
                  class="text-swatch square-text-swatch"
                  :class="{ 'is-selected': selectedAttributes[attr.name] === opt }"
                  @click="selectAttribute(attr.name, opt)"
                >
                  {{ opt }}
                </button>
              </div>

            </div>
          </div>

          <!-- Componente de Stock/Cantidad -->
          <div class="add-to-cart-section">
            <div class="quantity-selector">
              <button class="qty-btn" @click="decreaseQty" aria-label="Disminuir">-</button>
              <input type="number" class="qty-input" v-model.number="quantity" min="1" readonly>
              <button class="qty-btn" @click="increaseQty" aria-label="Aumentar">+</button>
            </div>
            
            <button class="add-to-cart-btn" @click="handleAddToCart">
              <span>Agregar al Carrito</span>
            </button>
          </div>
          
          <!-- Beneficios extra -->
          <ul class="product-features">
            <li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5l10 -10"/></svg> Envío gratis a todo México</li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5l10 -10"/></svg> Garantía de ensamblaje</li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5l10 -10"/></svg> Soporte técnico 24/7</li>
          </ul>

          <div class="product-short-desc margin-top" v-html="product.shortDescription || product.description"></div>

        </div>
      </div>
      <!-- Sección Recomendados (ocupa todo el ancho de vuelta afuera de product-view) -->
      <ProductGrid 
        v-if="recommendedProducts.length > 0"
        title="Recomendados" 
        subtitle="Para ti" 
        :products="recommendedProducts" 
      />
    </div>
    
    <div class="container empty-state" v-else>
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
      <h2>No encontramos este producto.</h2>
      <p>Es posible que haya sido removido de nuestro inventario temporalmente.</p>
      <RouterLink to="/" class="back-home-btn">Volver a la tienda</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  padding: 4rem 0 6rem 0;
  background-color: #ffffff;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ── LAYOUT PRINCIPAL ── */
.product-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-bottom: 5rem;
  align-items: flex-start; /* Necesario para que sticky funcione bien */
}

/* ── COLUMNA IZQUIERDA (Galería) ── */
.product-gallery-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 100px;
}

.main-image-box {
  background-color: #f9fafb;
  border-radius: 16px;
  height: 540px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2rem;
}

.thumbnail-list {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.thumbnail-list::-webkit-scrollbar {
  height: 6px;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 4px;
}

.thumb-btn {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 2px solid transparent;
  background-color: #f9fafb;
  cursor: pointer;
  padding: 0.5rem;
  transition: border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumb-btn:hover {
  border-color: #d1d5db;
}

.thumb-btn.active {
  border-color: var(--color-brand, #0a6837);
}

/* ── COLUMNA DERECHA (Detalles) ── */
.product-details {
  display: flex;
  flex-direction: column;
}

.product-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.75rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
  margin: 0 0 1rem 0;
}

.product-price-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.price-current {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-brand, #0a6837);
}

.product-short-desc {
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  color: #4b5563;
  line-height: 1.6;
}

.product-short-desc.margin-top {
  margin-top: 2rem;
}

/* ── VARIACIONES ── */
.product-variations {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.variation-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.variation-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.selected-label {
  font-weight: 400;
  color: #6b7280;
  text-transform: none;
  font-size: 0.9rem;
}

.swatches-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* Swatch de Color (Cuadrado con bordes suaves) */
.color-swatch {
  width: 44px;
  height: 44px;
  border-radius: 8px; /* Cuadritos */
  border: 2px solid transparent;
  padding: 3px;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.is-selected {
  border-color: var(--color-brand, #0a6837);
  transform: scale(1.1);
}

.color-fill {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 4px; /* Cuadritos interiores */
  border: 1px solid rgba(0,0,0,0.1);
}

/* Swatch de Texto (Voltaje, etc) */
.text-swatch {
  min-width: 44px;
  height: 44px;
  padding: 0 0.75rem;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px; /* Cuadritos */
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-swatch:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.text-swatch.is-selected {
  border-color: var(--color-brand, #0a6837);
  background-color: #f0fdf4; /* Verde super suavecito */
  color: var(--color-brand, #0a6837);
}

/* ── BOTONES / CANTIDAD ── */
.add-to-cart-section {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  height: 56px;
  width: 130px;
}

.qty-btn {
  background: transparent;
  border: none;
  width: 40px;
  height: 100%;
  font-size: 1.5rem;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.qty-btn:hover {
  background-color: #f3f4f6;
}

.qty-input {
  width: 50px;
  height: 100%;
  border: none;
  text-align: center;
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  pointer-events: none; /* read-only view */
}

/* Hide arrow on number input */
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.qty-input[type=number] {
  appearance: textfield;
}

.add-to-cart-btn {
  flex: 1;
  background-color: var(--color-brand, #0a6837);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-to-cart-btn:hover {
  background-color: var(--color-brand-dark, #028016);
  transform: translateY(-2px);
}

.add-to-cart-btn:active {
  transform: translateY(0);
}

/* ── BENEFITS ── */
.product-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.95rem;
}

.product-features svg {
  color: var(--color-brand, #0a6837);
}

/* ── TABS/DESCRIPCION ABAJO ── */
/* Estas clases ya no se usan porque quitamos la descripcion de abajo, pero se pueden mantener por limpieza 
   o eliminarse. Vamos a borrarlas para que no haya código basura. */

/* ── ESTADOS VACIOS Y SKELETONS ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 50vh;
}

.empty-state h2 {
  font-size: 2rem;
  margin: 1.5rem 0 0.5rem;
  color: #111827;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.back-home-btn {
  background-color: #111827;
  color: #ffffff;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;
}
.back-home-btn:hover {
  background-color: #374151;
}

.skeleton-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.skeleton-img {
  height: 540px;
  background-color: #f3f4f6;
  border-radius: 16px;
  animation: pulse 1.5s infinite;
}

.skeleton-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-title {
  height: 3rem;
  width: 80%;
  background-color: #f3f4f6;
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-price {
  height: 2.5rem;
  width: 40%;
  background-color: #f3f4f6;
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-desc {
  height: 8rem;
  width: 100%;
  background-color: #f3f4f6;
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* ── RESPONSIVE ── */
@media (max-width: 992px) {
  .product-view {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .main-image-box {
    height: 400px;
  }
}

@media (max-width: 576px) {
  .product-title {
    font-size: 2rem;
  }
  
  .add-to-cart-section {
    flex-direction: column;
  }
  
  .quantity-selector {
    width: 100%;
  }
  
  .add-to-cart-btn {
    padding: 1rem;
  }
}
</style>
