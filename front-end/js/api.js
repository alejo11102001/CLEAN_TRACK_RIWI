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
        const response = await fetch(`http://localhost:3000${endpoint}`, config);
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
        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method,   // 👈 Ahora usa el que le pases
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