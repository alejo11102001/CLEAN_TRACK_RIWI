document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');

    // Plantillas HTML para cada vista
    const views = {
        login: `
            <div class="form-wrapper">
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
                    <div class="input-group mb-3">
                        <div class="form-floating flex-grow-1">
                            <input type="password" class="form-control" id="password" placeholder="Contraseña" required>
                            <label for="password">Contraseña</label>
                        </div>
                        <span class="input-group-text password-toggle-btn" data-target="password"><i class="bi bi-eye-slash-fill"></i></span>
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
            </div>
        `,
        recover: `
            <div class="form-wrapper">
                <div class="text-center mb-4">
                    <i class="bi bi-envelope-arrow-up-fill icon-large"></i>
                    <h2 class="fw-bold mt-3">Recuperar Contraseña</h2>
                    <p class="text-muted">Ingresa tu correo y te enviaremos las instrucciones.</p>
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
            </div>
        `,
        checkEmail: `
            <div class="form-wrapper text-center">
                <i class="bi bi-envelope-check-fill icon-large mb-3"></i>
                <h2 class="fw-bold">Revisa tu Correo</h2>
                <p class="text-muted">
                    Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico. 
                    Si no lo ves, revisa tu carpeta de spam.
                </p>
                <div class="d-grid mt-4">
                    <a href="#" class="btn btn-outline-secondary" data-view="login">Volver a Iniciar Sesión</a>
                </div>
            </div>
        `,
        newPassword: `
            <div class="form-wrapper">
                <div class="text-center mb-4">
                    <i class="bi bi-shield-lock-fill icon-large"></i>
                    <h2 class="fw-bold mt-3">Crear Nueva Contraseña</h2>
                    <p class="text-muted">Ingresa y confirma tu nueva contraseña.</p>
                </div>
                <form id="newPasswordForm">
                    <div class="input-group mb-3">
                        <div class="form-floating flex-grow-1">
                            <input type="password" class="form-control" id="newPasswordInput" placeholder="Nueva Contraseña" required>
                            <label for="newPasswordInput">Nueva Contraseña</label>
                        </div>
                        <button type="button" class="btn btn-outline-secondary password-toggle-btn" data-target="newPasswordInput">
                            <i class="bi bi-eye-slash-fill"></i>
                        </button>
                    </div>
                    <div class="input-group mb-3">
                        <div class="form-floating flex-grow-1">
                            <input type="password" class="form-control" id="confirmPasswordInput" placeholder="Confirmar Contraseña" required>
                            <label for="confirmPasswordInput">Confirmar Contraseña</label>
                        </div>
                        <button type="button" class="btn btn-outline-secondary password-toggle-btn" data-target="confirmPasswordInput">
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
            </div>
        `
    };

    // Función para cambiar la vista con animación
    function switchView(viewName) {
        const currentWrapper = mainContent.querySelector('.form-wrapper');
        if (currentWrapper) {
            currentWrapper.classList.add('fade-out');
        }
        setTimeout(() => {
            mainContent.innerHTML = views[viewName] || views.login;
        }, 350); // Coincide con la duración de la animación de salida
    }

    // --- MANEJADORES DE EVENTOS ---

    // Usamos delegación de eventos para manejar todos los clics
    document.body.addEventListener('click', function(event) {
        const viewLink = event.target.closest('[data-view]');
        const toggleBtn = event.target.closest('.password-toggle-btn');

        // Manejar clics en enlaces de cambio de vista
        if (viewLink) {
            event.preventDefault();
            const view = viewLink.getAttribute('data-view');
            switchView(view);
        }

        // Manejar clics en el botón de mostrar/ocultar contraseña
        if (toggleBtn) {
            const targetInput = document.getElementById(toggleBtn.dataset.target);
            const icon = toggleBtn.querySelector('i');
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
            } else {
                targetInput.type = 'password';
                icon.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
            }
        }
    });

    // Manejar todos los envíos de formularios
    document.body.addEventListener('submit', function(event) {
        if (event.target.matches('#loginForm')) {
            event.preventDefault();
            console.log('Intento de login...');
            // Aquí iría la lógica de autenticación y redirección
            // window.location.href = 'dashboard.html';
        }

        if (event.target.matches('#recoverForm')) {
            event.preventDefault();
            console.log('Solicitud de recuperación enviada...');
            switchView('checkEmail'); // Muestra la pantalla de confirmación
        }

        if (event.target.matches('#newPasswordForm')) {
            event.preventDefault();
            const newPassword = document.getElementById('newPasswordInput').value;
            const confirmPassword = document.getElementById('confirmPasswordInput').value;
            if (newPassword !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }
            console.log('Contraseña actualizada. Redirigiendo a login...');
            alert('¡Contraseña guardada exitosamente!');
            switchView('login');
        }
    });

    // Cargar la vista inicial
    mainContent.innerHTML = views.login;
});