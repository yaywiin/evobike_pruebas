<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const isProcessing = ref(false)
const isSuccess = ref(false)
const orderSummary = ref(null)
const router = useRouter()
const mpPublicKey = 'APP_USR-3b174f88-7df2-4b88-ad03-df5619188ee8'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Códigos postales de Zamora y Jacona, Michoacán ───────────────────────
// Zamora: rangos 59600–59699 + algunos adicionales registrados por SEPOMEX
// Jacona: rangos 59800–59849 + colonias adicionales hasta 59899
const isZamoraJaconaCP = (cp) => {
  const num = parseInt(cp, 10)
  if (isNaN(num)) return false
  // Zamora de Hidalgo, Mich.
  if (num >= 59600 && num <= 59799) return true
  // Jacona de Plancarte, Mich.
  if (num >= 59800 && num <= 59899) return true
  return false
}

// Valida que sea un CP mexicano (exactamente 5 dígitos numéricos, rango 01000–99999)
const isMexicanCP = (cp) => {
  return /^\d{5}$/.test(cp) && parseInt(cp, 10) >= 1000
}

// ─── Estado reactivo de envío ──────────────────────────────────────────────
const shippingStatus = ref('pending') // 'pending' | 'free' | 'paid' | 'unavailable'
const shippingCost = computed(() => {
  if (shippingStatus.value === 'free') return 0
  if (shippingStatus.value === 'paid') return 500
  return null // pending o unavailable
})
const orderTotal = computed(() => {
  if (shippingCost.value === null) return cart.subtotal
  return cart.subtotal + shippingCost.value
})

const customerInfo = reactive({
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postcode: '',
  state: ''
})

// Evalúa el CP cada vez que cambia (debe ir DESPUÉS de customerInfo)
watch(() => customerInfo.postcode, (cp) => {
  const trimmed = (cp || '').trim()
  if (trimmed === '') {
    shippingStatus.value = 'pending'
    return
  }
  if (!isMexicanCP(trimmed)) {
    shippingStatus.value = 'unavailable'
    return
  }
  if (isZamoraJaconaCP(trimmed)) {
    shippingStatus.value = 'free'
  } else {
    shippingStatus.value = 'paid'
  }
})


onMounted(() => {
  if (cart.items.length > 0) {
    initializePaymentBrick()
  }
})

const initializePaymentBrick = async () => {
  try {
    const mp = new window.MercadoPago(mpPublicKey, {
      locale: 'es-MX'
    })
    
    const bricksBuilder = mp.bricks()
    
    const renderPaymentBrick = async (bricksBuilder) => {
      const settings = {
        initialization: {
          amount: orderTotal.value,
        },
        customization: {
          visual: {
            style: {
              theme: 'default',
            }
          },
          maxInstallments: 1,
        },
        callbacks: {
          onReady: () => {
            console.log('Payment Brick Ready')
          },
          onSubmit: async (cardFormData) => {
            isProcessing.value = true
            try {
              const payload = {
                paymentData: cardFormData,
                customerInfo: customerInfo,
                cartItems: cart.items.map(item => ({
                  id: item.id,
                  quantity: item.quantity,
                  price: item.price,
                  name: item.name
                }))
              }
              const response = await fetch(`${API_URL}/api/process_payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              })
              
              const result = await response.json()
              console.log('Resultado del pago:', result)
              
              if (result.status === 'approved' || result.status === 'in_process') {
                orderSummary.value = {
                  id: result.wc_order_id || result.id,
                  date: new Date().toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }),
                  name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                  address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state}`,
                  total: orderTotal.value,
                  shipping: shippingCost.value
                }
                isSuccess.value = true
                cart.clearCart()
              } else {
                alert(`Hubo un problema con el pago: ${result.status_detail}`)
              }

            } catch (error) {
              console.error(error)
              alert('Ocurrió un error al procesar tu pago por favor intenta de nuevo.')
            } finally {
              isProcessing.value = false
            }
          },
          onError: (error) => {
            console.error(error)
          },
        },
      }
      
      window.paymentBrickController = await bricksBuilder.create(
        'cardPayment',
        'paymentBrick_container',
        settings
      )
    }
    
    renderPaymentBrick(bricksBuilder)
    
  } catch (error) {
    console.error('Error al cargar Mercado Pago Brick:', error)
  }
}

const formatPrice = (price) => {
  const numericPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^\d.-]/g, ''))
    : Number(price)
  
  if (isNaN(numericPrice)) return price
  return `$ ${numericPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

// processCheckout manual eliminado, el Brick maneja su propio submit
</script>

<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="checkout-title">Finalizar Compra</h1>
      
      <div v-if="isSuccess" class="success-container">
        <div class="success-card">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2>¡Gracias por tu compra!</h2>
          <p class="success-msg">Tu pedido ha sido recibido y está siendo procesado.</p>
          
          <div class="order-details-box">
            <div class="detail-row">
              <span class="label">Número de pedido:</span>
              <span class="value">#{{ orderSummary.id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">{{ orderSummary.date }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Nombre:</span>
              <span class="value">{{ orderSummary.name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Lugar de entrega:</span>
              <span class="value">{{ orderSummary.address }}</span>
            </div>
            <div class="detail-row total-row-summary">
              <span class="label">Total:</span>
              <span class="value">{{ formatPrice(orderSummary.total) }}</span>
            </div>
          </div>
          
          <p class="email-notice">Hemos enviado los detalles de tu compra a <strong>{{ customerInfo.email }}</strong></p>
          
          <RouterLink to="/" class="btn-continue-shopping">Volver a la tienda</RouterLink>
        </div>
      </div>

      <div v-else-if="cart.items.length === 0" class="empty-checkout">
        <p>No tienes productos en tu carrito para procesar.</p>
        <RouterLink to="/" class="btn-return">Volver a la tienda</RouterLink>
      </div>

      
      <div v-else class="checkout-grid">
        <!-- Columna de formulario / datos de envío -->
        <div class="checkout-form-col">
          <div class="checkout-block">
            <h3>Información de Contacto</h3>
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" v-model="customerInfo.email" placeholder="tu@email.com" class="form-control" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" v-model="customerInfo.phone" placeholder="123 456 7890" class="form-control" />
            </div>
          </div>
          
          <div class="checkout-block">
            <h3>Dirección de Envío</h3>
            <div class="form-row">
              <div class="form-group half">
                <label>Nombre</label>
                <input type="text" v-model="customerInfo.firstName" class="form-control" />
              </div>
              <div class="form-group half">
                <label>Apellidos</label>
                <input type="text" v-model="customerInfo.lastName" class="form-control" />
              </div>
            </div>
            <div class="form-group">
              <label>Calle y Número</label>
              <input type="text" v-model="customerInfo.address" class="form-control" />
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label>Ciudad</label>
                <input type="text" v-model="customerInfo.city" class="form-control" />
              </div>
              <div class="form-group half">
                <label>Código Postal</label>
                <input type="text" v-model="customerInfo.postcode" class="form-control" />
              </div>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="customerInfo.state" class="form-control">
                <option value="">Selecciona un Estado</option>
                <option value="Aguascalientes">Aguascalientes</option>
                <option value="Baja California">Baja California</option>
                <option value="Baja California Sur">Baja California Sur</option>
                <option value="Campeche">Campeche</option>
                <option value="Chiapas">Chiapas</option>
                <option value="Chihuahua">Chihuahua</option>
                <option value="Ciudad de México">Ciudad de México</option>
                <option value="Coahuila">Coahuila</option>
                <option value="Colima">Colima</option>
                <option value="Durango">Durango</option>
                <option value="Estado de México">Estado de México</option>
                <option value="Guanajuato">Guanajuato</option>
                <option value="Guerrero">Guerrero</option>
                <option value="Hidalgo">Hidalgo</option>
                <option value="Jalisco">Jalisco</option>
                <option value="Michoacán">Michoacán</option>
                <option value="Morelos">Morelos</option>
                <option value="Nayarit">Nayarit</option>
                <option value="Nuevo León">Nuevo León</option>
                <option value="Oaxaca">Oaxaca</option>
                <option value="Puebla">Puebla</option>
                <option value="Querétaro">Querétaro</option>
                <option value="Quintana Roo">Quintana Roo</option>
                <option value="San Luis Potosí">San Luis Potosí</option>
                <option value="Sinaloa">Sinaloa</option>
                <option value="Sonora">Sonora</option>
                <option value="Tabasco">Tabasco</option>
                <option value="Tamaulipas">Tamaulipas</option>
                <option value="Tlaxcala">Tlaxcala</option>
                <option value="Veracruz">Veracruz</option>
                <option value="Yucatán">Yucatán</option>
                <option value="Zacatecas">Zacatecas</option>
              </select>
            </div>
          </div>
          
          <div class="checkout-block">
            <h3>Pago Seguro</h3>
            <div id="paymentBrick_container"></div>
          </div>
        </div>
        
        <!-- Columna Resumen de Pedido -->
        <div class="checkout-summary-col">
          <div class="summary-card">
            <h3>Resumen del Pedido</h3>
            
            <div class="summary-items">
              <div v-for="item in cart.items" :key="item.id" class="summary-item">
                <div class="item-img-wrapper">
                  <img :src="item.image" :alt="item.name" v-if="item.image" />
                  <div class="placeholder" v-else></div>
                  <span class="item-qty-badge">{{ item.quantity }}</span>
                </div>
                <div class="item-info">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-meta" v-if="Object.keys(item.selectedOptions || {}).length > 0">
                    <span v-for="(val, key) in item.selectedOptions" :key="key">{{ key }}: {{ val }}</span>
                  </span>
                </div>
                <div class="item-price">{{ formatPrice(item.price * item.quantity) }}</div>
              </div>
            </div>
            
            <div class="summary-totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>{{ formatPrice(cart.subtotal) }}</span>
              </div>

              <!-- Fila de envío: cambia según el CP -->
              <div class="total-row" v-if="shippingStatus === 'pending'">
                <span>Envío</span>
                <span class="shipping-pending">Ingresa tu código postal</span>
              </div>
              <div class="total-row shipping-free" v-else-if="shippingStatus === 'free'">
                <span>Envío</span>
                <span class="shipping-badge free">🎉 Gratis</span>
              </div>
              <div class="total-row" v-else-if="shippingStatus === 'paid'">
                <span>Envío</span>
                <span>{{ formatPrice(500) }}</span>
              </div>
              <div class="total-row shipping-error" v-else-if="shippingStatus === 'unavailable'">
                <span>Envío</span>
                <span class="shipping-badge unavailable">No disponible</span>
              </div>

              <!-- Mensaje de error para CP fuera de México -->
              <div class="shipping-unavailable-msg" v-if="shippingStatus === 'unavailable'">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                No realizamos envíos a la dirección proporcionada. Solo enviamos dentro de la República Mexicana.
              </div>

              <div class="total-row grand-total">
                <span>Total</span>
                <span>{{ formatPrice(orderTotal) }}</span>
              </div>
            </div>
            
            <div class="secure-checkout-notice" style="margin-top: 1.5rem; text-align: center; color: #6b7280; font-size: 0.9rem;">
              <p>🔒 Completa tu pago de forma segura usando el formulario de la izquierda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  padding: 4rem 0 6rem 0;
  background-color: #f9fafb;
  min-height: calc(100vh - 100px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.checkout-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  align-items: flex-start;
}

/* Formulario */
.checkout-form-col {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.checkout-block {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
}

.checkout-block h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.75rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.half {
  flex: 1;
}

.form-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: border-color 0.2s;
  background-color: #f9fafb;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-brand, #0a6837);
  background-color: #ffffff;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  background-color: #f9fafb;
  font-weight: 500;
}

.payment-option:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

/* Resumen */
.summary-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  position: sticky;
  top: 100px;
}

.summary-card h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #111827;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  max-height: 40vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-img-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.item-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.item-qty-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--color-brand, #0a6837);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #374151;
  margin-bottom: 0.25rem;
}

.item-meta {
  font-size: 0.8rem;
  color: #6b7280;
  display: flex;
  gap: 0.5rem;
}

.item-price {
  font-weight: 600;
  color: #111827;
}

.summary-totals {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4b5563;
  font-size: 1rem;
}

.grand-total {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #d1d5db;
}

/* Shipping status badges */
.shipping-pending {
  font-size: 0.82rem;
  color: #9ca3af;
  font-style: italic;
}

.shipping-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.7rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
}

.shipping-badge.free {
  background-color: #d1fae5;
  color: #065f46;
}

.shipping-badge.unavailable {
  background-color: #fee2e2;
  color: #991b1b;
}

.shipping-unavailable-msg {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background-color: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.82rem;
  color: #9a3412;
  line-height: 1.4;
  margin-top: 0.25rem;
}

.shipping-unavailable-msg svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: #ea580c;
}

.btn-pay {
  width: 100%;
  padding: 1.2rem;
  background-color: var(--color-brand, #0a6837);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.btn-pay:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-pay:not(:disabled):hover {
  background-color: var(--color-brand-dark, #028016);
  transform: translateY(-2px);
}

.btn-return {
  display: inline-block;
  background-color: #111827;
  color: #ffffff;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 992px) {
  .checkout-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .summary-card {
    position: static;
  }
}

@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

/* Success State Styles */
.success-container {
  max-width: 600px;
  margin: 2rem auto 4rem;
  padding: 0 1rem;
}

.success-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  text-align: center;
  border: 1px solid #e5e7eb;
}

.success-icon {
  color: #10A325;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.success-card h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.success-msg {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
}

.order-details-box {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
  border: 1px solid #f3f4f6;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #ebebeb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.95rem;
}

.detail-row .value {
  color: #1a1a1a;
  font-weight: 600;
  text-align: right;
  padding-left: 1rem;
}

.total-row-summary {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px dashed #d1d5db;
}

.total-row-summary .label {
  color: #1a1a1a;
  font-size: 1.1rem;
  font-weight: 700;
}

.total-row-summary .value {
  color: #10A325;
  font-size: 1.25rem;
  font-weight: 800;
}

.email-notice {
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 2rem;
}

.btn-continue-shopping {
  display: inline-block;
  background-color: #1a1a1a;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s ease;
}

.btn-continue-shopping:hover {
  background-color: #10A325;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 163, 37, 0.2);
}
</style>

