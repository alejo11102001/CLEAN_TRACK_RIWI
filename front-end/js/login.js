import { request } from '../../front-end/js/api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Make sure the login form element exists on the page
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Llama a la API para iniciar sesión
                const data = await request('/api/login', 'POST', { email, password });
                
                // Guarda el token
                localStorage.setItem('authToken', data.token);

                // Muestra la alerta de éxito
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Inicio de sesión correcto.',
                    icon: 'success',
                    timer: 2000, // La alerta dura 2 segundos
                    showConfirmButton: false
                });

                // Espera 2 segundos y luego redirige
                setTimeout(() => {
                    if (data.user.role === 'Admin') {
                        window.location.href = './dashboard_admin.html';
                    } else if (data.user.role === 'Empleado') {
                        window.location.href = './zones_employee.html'; 
                    }
                }, 2000); // 2000 milisegundos = 2 segundos

            } catch (error) {
                // Para el error, usamos un alert simple
                alert(`Error: ${error.message}`);
            }
        });
    }
});