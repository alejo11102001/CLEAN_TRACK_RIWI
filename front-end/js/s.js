document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');

    // Plantillas HTML para cada vista
    const views = {
        login: `
            <div class="text-center mb-4">
                <img src="./img/logo.png" alt="Logo RIWI" class="logo-img">
                <h2 class="fw-bold">Iniciar Sesión</h2>
                <p class="text-muted">Ingresa tus credenciales para acceder a tu cuenta.</p>
            </div>
            <form id="loginForm">
                <div class="form-floating mb-3">
                    <input type="email" class="form-control" id="email" placeholder="nombre@ejemplo.com" required>
                    <label for="email">Correo Electrónico</label>
                </div>
                <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="password" placeholder="Contraseña" required>
                    <label for="password">Contraseña</label>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="rememberMe">
                        <label class="form-check-label" for="rememberMe">Recordarme</label>
                    </div>
                    <a href="#" class="forgot-link" data-view="recover">¿Olvidó su contraseña?</a>
                </div>
                <div class="d-grid mb-3">
                    <button type="submit" class="btn btn-riwi-primary text-uppercase py-2">Acceder</button>
                </div>
            </form>
        `,
        recover: `
            <div class="text-center mb-4">
                <i class="bi bi-envelope-arrow-up-fill text-riwi-green icon-large"></i>
                <h2 class="fw-bold mt-3">¿Olvidaste tu contraseña?</h2>
                <p class="text-muted">Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.</p>
            </div>
            <form id="recoverForm">
                <div class="form-floating mb-3">
                    <input type="email" class="form-control" id="recoverEmail" placeholder="nombre@ejemplo.com" required>
                    <label for="recoverEmail">Correo Electrónico</label>
                </div>
                <div class="d-grid mt-4">
                    <button type="submit" class="btn btn-riwi-primary text-uppercase py-2">Enviar Enlace</button>
                </div>
            </form>
            <p class="text-center mt-4">
                <a href="#" class="forgot-link" data-view="login">Volver a Iniciar Sesión</a>
            </p>
        `,
        newPassword: `
            <div class="text-center mb-4">
                <i class="bi bi-shield-lock-fill text-riwi-green icon-large"></i>
                <h2 class="fw-bold mt-3">Crear Nueva Contraseña</h2>
                <p class="text-muted">Ingresa y confirma tu nueva contraseña.</p>
            </div>
            <form id="newPasswordForm">
                <div class="input-group mb-3">
                    <div class="form-floating flex-grow-1">
                        <input type="password" class="form-control" id="newPassword" placeholder="Nueva Contraseña" required>
                        <label for="newPassword">Nueva Contraseña</label>
                    </div>
                    <button type="button" class="btn btn-outline-secondary password-toggle-btn" id="toggleNewPassword">
                        <i class="bi bi-eye-slash-fill"></i>
                    </button>
                </div>
                <div class="input-group mb-3">
                    <div class="form-floating flex-grow-1">
                        <input type="password" class="form-control" id="confirmPassword" placeholder="Confirmar Contraseña" required>
                        <label for="confirmPassword">Confirmar Contraseña</label>
                    </div>
                    <button type="button" class="btn btn-outline-secondary password-toggle-btn" id="toggleConfirmPassword">
                        <i class="bi bi-eye-slash-fill"></i>
                    </button>
                </div>
                <div class="d-grid mt-4">
                    <button type="submit" class="btn btn-riwi-primary text-uppercase py-2">Guardar Contraseña</button>
                </div>
            </form>
            <p class="text-center mt-4">
                <a href="#" class="forgot-link" data-view="login">Volver a Iniciar Sesión</a>
            </p>
        `
    };

    // Función para cambiar la vista
    function switchView(viewName) {
        mainContent.innerHTML = views[viewName] || views.login;
        addEventListeners(); // Volver a añadir los listeners a los nuevos elementos
    }

    // Función para añadir los event listeners
    function addEventListeners() {
        // Listeners para los enlaces que cambian de vista
        const viewLinks = document.querySelectorAll('[data-view]');
        viewLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const view = link.getAttribute('data-view');
                switchView(view);
            });
        });

        // Listener para el formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                // Lógica de autenticación...
                console.log('Intento de login');
                // Simular redirección
                window.location.href = 'zones_employee.html'; 
            });
        }

        // Listener para el formulario de recuperar contraseña
        const recoverForm = document.getElementById('recoverForm');
        if (recoverForm) {
            recoverForm.addEventListener('submit', (event) => {
                event.preventDefault();
                console.log('Solicitud de recuperación enviada');
                alert('Se ha enviado un enlace a tu correo.');
                switchView('newPassword'); // Simular que el enlace lleva a crear nueva contraseña
            });
        }

        // Listeners para mostrar/ocultar contraseña
        const toggleNewPassword = document.getElementById('toggleNewPassword');
        if (toggleNewPassword) {
            toggleNewPassword.addEventListener('click', () => {
                togglePasswordVisibility('newPassword');
            });
        }

        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        if (toggleConfirmPassword) {
            toggleConfirmPassword.addEventListener('click', () => {
                togglePasswordVisibility('confirmPassword');
            });
        }
    }

    // Función para alternar la visibilidad de la contraseña
    function togglePasswordVisibility(inputId) {
        const passwordInput = document.getElementById(inputId);
        const icon = document.querySelector(`[id="toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}"] i`);
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('bi-eye-slash-fill');
            icon.classList.add('bi-eye-fill');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('bi-eye-fill');
            icon.classList.add('bi-eye-slash-fill');
        }
    }

    // Cargar la vista inicial
    switchView('login');
});