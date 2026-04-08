import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    // Estado
    // Buscamos si ya hay un carrito guardado en localStorage
    const localCart = localStorage.getItem('evobike-cart')
    const items = ref(localCart ? JSON.parse(localCart) : [])
    const isCartOpen = ref(false)

    // Computados
    const totalItems = computed(() => {
        return items.value.reduce((acc, item) => acc + item.quantity, 0)
    })

    const subtotal = computed(() => {
        return items.value.reduce((acc, item) => {
            // Remover símbolos de $ y comas si vienen en formato string, pero la idea es que price sea numérico
            const numericPrice = typeof item.price === 'string'
                ? parseFloat(item.price.replace(/[$,]/g, ''))
                : item.price
            return acc + (numericPrice * item.quantity)
        }, 0)
    })

    // Acciones
    const saveToStorage = () => {
        localStorage.setItem('evobike-cart', JSON.stringify(items.value))
    }

    const openCart = () => {
        isCartOpen.value = true
    }

    const closeCart = () => {
        isCartOpen.value = false
    }

    const addToCart = (product) => {
        // Verificar si el producto ya existe en el carrito
        const existingItem = items.value.find(item => item.id === product.id)

        if (existingItem) {
            existingItem.quantity += 1
        } else {
            items.value.push({
                id: product.id,
                name: product.name,
                price: product.price, // Asegurarse de que el componente mande un número
                image: product.image || null,
                quantity: 1
            })
        }
        saveToStorage()
        openCart()
    }

    const removeFromCart = (productId) => {
        items.value = items.value.filter(item => item.id !== productId)
        saveToStorage()
    }

    const updateQuantity = (productId, quantity) => {
        const item = items.value.find(item => item.id === productId)
        if (item) {
            if (quantity <= 0) {
                removeFromCart(productId)
            } else {
                item.quantity = quantity
                saveToStorage()
            }
        }
    }

    const clearCart = () => {
        items.value = []
        saveToStorage()
    }

    return {
        items,
        totalItems,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    }
})
