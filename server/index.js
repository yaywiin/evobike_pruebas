require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())

const WC_URL = process.env.VITE_WC_URL || 'https://tu-tienda.com'
const WC_KEY = process.env.VITE_WC_CONSUMER_KEY || ''
const WC_SECRET = process.env.VITE_WC_CONSUMER_SECRET || ''

app.get('/api/products/bestsellers', async (req, res) => {
  try {
    const response = await axios.get(`${WC_URL}/wp-json/wc/v3/products`, {
      params: {
        orderby: 'popularity',
        order: 'desc',
        per_page: 4,
        status: 'publish',
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET
      }
    })
    
    // Mapeamos solo lo que necesita el frontend para no enviar data innecesaria
    const mappedProducts = response.data.map(product => {
      // Extraer URLs de imagen principal (si hay)
      let primaryImage = null
      if (product.images && product.images.length > 0) {
        primaryImage = product.images[0].src
      }
      
      // Formatear precios (WC envía precios crudos)
      const currentPrice = product.price ? `$ ${parseFloat(product.price).toLocaleString('es-MX', {minimumFractionDigits: 2})}` : ''
      const regularPrice = product.regular_price ? `$ ${parseFloat(product.regular_price).toLocaleString('es-MX', {minimumFractionDigits: 2})}` : ''
      
      return {
        id: product.id,
        name: product.name,
        // Si el precio actual es menor al precio regular, mostramos el tachado
        price: currentPrice,
        compareAtPrice: currentPrice !== regularPrice ? regularPrice : null,
        image: primaryImage,
        // Lógica de "badge" (Popular, Oferta, etc.) se puede sacar de etiquetas o estado "on_sale"
        badge: product.on_sale ? 'Oferta' : (product.featured ? 'Destacado' : '') 
      }
    })
    
    res.json(mappedProducts)
  } catch (error) {
    console.error("Error fetching WC products:", error.message)
    res.status(500).json({ error: 'Error connecting to WooCommerce store' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Evobike API Proxy running on port ${PORT}`))
