const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchWooCommerceProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/api/products/random?limit=4`)
        if (!response.ok) throw new Error('Network response was not ok')
        return await response.json()
    } catch (error) {
        console.error('Error fetching random products:', error)
        return []
    }
}

export const fetchAllProducts = async (params = {}) => {
    try {
        const qs = new URLSearchParams(params).toString()
        const response = await fetch(`${API_URL}/api/products${qs ? '?' + qs : ''}`)
        if (!response.ok) throw new Error('Network response was not ok')
        return await response.json()
    } catch (error) {
        console.error('Error fetching all products:', error)
        return []
    }
}

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/api/categories`)
        if (!response.ok) throw new Error('Network response was not ok')
        return await response.json()
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}

export const fetchColors = async () => {
    try {
        const response = await fetch(`${API_URL}/api/attributes/colors`)
        if (!response.ok) throw new Error('Network response was not ok')
        return await response.json()
    } catch (error) {
        console.error('Error fetching colors:', error)
        return { terms: [] }
    }
}
