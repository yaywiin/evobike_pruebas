<script setup>
import { ref, onMounted } from 'vue'
import HeroCarousel from '@/components/HeroCarousel.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import AboutUs from '@/components/AboutUs.vue'
import { fetchWooCommerceProducts } from '@/services/api'

// Fallback placeholders en caso de que la API falle o esté vacía
const fallbackProducts = [
  { name: 'Aguila Pro', price: '$ 24,990.00', compareAtPrice: '$ 28,000.00', badge: 'Popular' },
  { name: 'Galaxy Plus', price: '$ 18,500.00' },
  { name: 'Cargo', price: '$ 32,000.00', badge: 'Nuevo' },
  { name: 'Ricochet', price: '$ 8,900.00', compareAtPrice: '$ 10,500.00' }
]

const products = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await fetchWooCommerceProducts()
    products.value = data && data.length > 0 ? data : fallbackProducts
  } catch (error) {
    products.value = fallbackProducts
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home-wrapper">
    <HeroCarousel />
    <ProductGrid 
      title="Tienda" 
      subtitle="Nuestros productos" 
      viewAllLink="/shop"
      :products="products"
      :loading="loading"
    />
    <AboutUs />
  </div>
</template>

