export const fetchWooCommerceProducts = async () => {
    try {
        // Apunta al backend en Node.js que acabamos de crear
        const response = await fetch('http://localhost:3001/api/products/bestsellers')

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}
