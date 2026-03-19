const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchWooCommerceProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/api/products/bestsellers`)

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}
