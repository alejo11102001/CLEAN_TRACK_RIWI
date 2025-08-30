// 1. URL base de tu API desplegada en Render
export const API_BASE_URL = 'https://cleantrack-api.onrender.com';

// Función para obtener el token guardado en localStorage
const getToken = () => localStorage.getItem('authToken');

// Función genérica para hacer solicitudes a la API
const request = async (endpoint, method = 'GET', body = null) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        // --- CAMBIO AQUÍ ---
        // Ahora usa la variable API_BASE_URL
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// Función específica para subir archivos (usa FormData)
const requestWithFile = async (endpoint, formData, method = 'POST') => {
    const headers = {};
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        // --- CAMBIO AQUÍ ---
        // Ahora usa la variable API_BASE_URL
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API File Upload Error:', error);
        throw error;
    }
};

export { request, requestWithFile };