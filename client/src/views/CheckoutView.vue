<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const isProcessing = ref(false)
const router = useRouter()
const mpPublicKey = 'APP_USR-3b174f88-7df2-4b88-ad03-df5619188ee8'

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
          amount: cart.subtotal,
          preferenceId: '<PREFERENCE_ID>',
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
              const response = await fetch("http://localhost:3001/api/process_payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(cardFormData),
              })
              
              const result = await response.json()
              console.log('Resultado del pago:', result)
              
              if (result.status === 'approved' || result.status === 'in_process') {
                alert(`¡Pago exitoso o en proceso! ID: ${result.id}`)
                cart.clearCart()
                router.push('/')
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
      
      <div v-if="cart.items.length === 0" class="empty-checkout">
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
              <input type="email" placeholder="tu@email.com" class="form-control" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" placeholder="123 456 7890" class="form-control" />
            </div>
          </div>
          
          <div class="checkout-block">
            <h3>Dirección de Envío</h3>
            <div class="form-row">
              <div class="form-group half">
                <label>Nombre</label>
                <input type="text" class="form-control" />
              </div>
              <div class="form-group half">
                <label>Apellidos</label>
                <input type="text" class="form-control" />
              </div>
            </div>
            <div class="form-group">
              <label>Calle y Número</label>
              <input type="text" class="form-control" />
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label>Ciudad</label>
                <input type="text" class="form-control" />
              </div>
              <div class="form-group half">
                <label>Código Postal</label>
                <input type="text" class="form-control" />
              </div>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select class="form-control">
                <option value="">Selecciona un Estado</option>
                <option value="Michoacán">Michoacán</option>
                <option value="Jalisco">Jalisco</option>
                <option value="CDMX">CDMX</option>
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
              <div class="total-row">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div class="total-row grand-total">
                <span>Total</span>
                <span>{{ formatPrice(cart.subtotal) }}</span>
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
</style>
