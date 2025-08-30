// Script para la página de establecer nueva contraseña
    const API_BASE_URL = 'http://localhost:3000'; // URL de tu backend

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.querySelector('form');
        const newPasswordField = document.getElementById('newPassword');
        const confirmPasswordField = document.getElementById('confirmPassword');
        const submitButton = form.querySelector('button[type="submit"]');

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            document.querySelector('main').innerHTML = `
                <div class="text-center">
                    <i class="bi bi-x-circle-fill text-danger icon-large"></i>
                    <h2 class="fw-bold mt-3">Token Inválido o Faltante</h2>
                    <p class="text-danger">Asegúrate de usar el enlace que te enviamos por correo.</p>
                    <a href="./index.html" class="btn btn-riwi-primary mt-3">Volver a Inicio</a>
                </div>
            `;
            return;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newPassword = newPasswordField.value;
            const confirmPassword = confirmPasswordField.value;

            if (newPassword !== confirmPassword) {
                return Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
            }
            if (newPassword.length < 8) {
                return Swal.fire('Atención', 'La contraseña debe tener al menos 8 caracteres.', 'warning');
            }

            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;

            try {
                 const payload = { token, newPassword }; // Creamos el objeto a enviar
                console.log('FRONTEND: Enviando estos datos al backend:', payload);
                const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                await Swal.fire('¡Éxito!', data.message, 'success');
                window.location.href = './index.html';

            } catch (error) {
                Swal.fire('Error', `No se pudo restablecer: ${error.message}`, 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Guardar Contraseña';
            }
        });
        
        document.querySelectorAll('.password-toggle-btn').forEach(button => {
            button.addEventListener('click', function() {
                const input = this.closest('.input-group').querySelector('input');
                const icon = this.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
                } else {
                    input.type = 'password';
                    icon.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
                }
            });
        });
    });