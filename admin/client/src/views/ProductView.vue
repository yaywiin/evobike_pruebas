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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const fetchProduct = async (id) => {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`)
    if (!res.ok) throw new Error('Error al cargar el producto')
    
    product.value = await res.json()
    mainImage.value = product.value.image
    
    // Si la foto está en la galería, usamos la primera
    if (!mainImage.value && product.value.images && product.value.images.length > 0) {
      mainImage.value = product.value.images[0].src
    }

    // Seleccionar primer color y primer voltaje por defecto si existen
    if (product.value.attributes) {
      product.value.attributes.forEach(attr => {
        if (attr.options && attr.options.length > 0) {
          selectAttribute(attr.name, attr.options[0])
        }
      })
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
    const res = await fetch(`${API_URL}/api/products/random?limit=5`)
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

  // Buscar si hay una variación que coincida con lo que acabamos de seleccionar
  // Para el cambio de imagen, priorizamos el match de COLOR
  if (product.value && product.value.variations && product.value.variations.length > 0) {
    const searchOpt = String(option).trim().toLowerCase()
    
    // Buscamos una variación que tenga este atributo específico
    const matchedVariation = product.value.variations.find(v => {
      return v.attributes.some(a => 
        a.name.toLowerCase() === attrName.toLowerCase() && 
        String(a.option).trim().toLowerCase() === searchOpt
      )
    })

    if (matchedVariation && matchedVariation.image) {
      mainImage.value = matchedVariation.image
    } else {
      // Si la variación no tiene foto específica, volvemos a la principal
      mainImage.value = product.value.image
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
    'celeste': '#38bdf8',
    'dorado': '#dbb018',
    'tornasol': 'linear-gradient(45deg, #ff00ff, #00ffff)',
    'fucsia': '#ff00ff',
    'menta': '#a7f3d0',
    'vino': '#722f37'
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
          
          <div class="product-short-desc margin-top" v-html="product.shortDescription || product.description"></div>

          <!-- Bloque de información extra y garantías -->
          <div class="extra-info-container">

            <div class="info-row">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
              <div class="info-content">
                <strong>Disponible para envío</strong>
              </div>
            </div>

            <div class="info-row">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <div class="info-content">
                <strong>Recogida disponible en Sucursal Centro</strong>
                <p class="subtitle-info">Normalmente está listo en 2 a 4 días</p>
                <a href="#" class="link-info" @click.prevent>Consultar disponibilidad en tienda</a>
              </div>
            </div>

            <div class="payment-methods-list">
              <span class="pm-chip">Visa</span>
              <span class="pm-chip">Mastercard</span>
              <span class="pm-chip">Amex</span>
              <span class="pm-chip">Amazon Pay</span>
              <span class="pm-chip">Apple Pay</span>
              <span class="pm-chip">PayPal</span>
            </div>

            <!-- Aviso de Pagos y Seguridad -->
            <div class="payment-notice">
              <p>Aceptamos <strong>tarjetas de crédito y débito</strong> y <strong>transferencias bancarias</strong>.</p>
              <p><strong>Todos los pedidos están sujetos a validación de identidad</strong> (el nombre del titular de la tarjeta debe coincidir con el nombre registrado en el pedido), podrán ser <strong>cancelados y reembolsados</strong> si no se completa el proceso de verificación.</p>
              <p class="delivery-disclaimer">*Será necesario presentar una identificación oficial al momento de la entrega.</p>
            </div>

            <!-- Grid de Características y Garantías -->
            <div class="feature-grid">
              <div class="feature-box">
                <div class="feature-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                </div>
                <div class="feature-text">
                  <strong>1 año de garantía</strong>
                  <p>Tu Evobike cuenta con una garantía limitada de 1 año en componentes clave, como motor y controlador. Compra con confianza</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </div>
                <div class="feature-text">
                  <strong>Cambios 5 días hábiles</strong>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <div class="feature-text">
                  <strong>Recoge en sucursal</strong>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                </div>
                <div class="feature-text">
                  <strong>Pagos seguros</strong>
                  <p>Compra con total seguridad</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                </div>
                <div class="feature-text">
                  <strong>Servicio técnico oficial</strong>
                  <p>Soporte especializado y refacciones originales EvoBike.</p>
                </div>
              </div>
            </div>
            
          </div>

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

/* ── AVISO DE PAGO ── */
.payment-notice {
  margin-top: 2rem;
  margin-bottom: 2.5rem;
  padding: 1.25rem 1.5rem;
  background-color: #f8fafc;
  border-radius: 12px;
  border-left: 5px solid var(--color-brand, #0a6837);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.payment-notice p {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 0.85rem;
}

.payment-notice p:last-child {
  margin-bottom: 0;
}

.delivery-disclaimer {
  font-style: italic;
  font-weight: 500;
  color: #374151 !important;
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

/* ── EXTRA INFO CONTAINER ── */
.extra-info-container {
  margin-top: 3rem;
  padding-top: 2.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  color: var(--color-brand, #0a6837);
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-family: 'Inter', sans-serif;
  color: #111827;
  font-size: 0.95rem;
}

.subtitle-info {
  margin: 0;
  color: #4b5563;
  font-size: 0.85rem;
}

.link-info {
  color: #111827;
  text-decoration: underline;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.25rem;
}

.link-info:hover {
  color: var(--color-brand, #0a6837);
}

.payment-methods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.pm-chip {
  padding: 0.35rem 0.75rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── FEATURE GRID ── */
.feature-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.feature-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feature-icon {
  color: var(--color-brand, #0a6837);
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-family: 'Inter', sans-serif;
}

.feature-text.strong {
  color: #111827;
  font-size: 0.95rem;
}

.feature-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.5;
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
  
  .product-gallery-container {
    position: relative;
    top: 0;
    z-index: 1;
  }
  
  .main-image-box {
    height: auto;
    aspect-ratio: 1 / 1;
  }
}

@media (max-width: 576px) {
  .product-page {
    padding: 2rem 0 4rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .product-view {
    gap: 2rem;
  }

  .product-title {
    font-size: 1.75rem;
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
  
  .main-img {
    padding: 1rem;
  }

  .thumb-btn {
    width: 60px;
    height: 60px;
  }

  .thumbnail-list {
    display: none;
  }
}
</style>
