document.addEventListener('DOMContentLoaded', function () {
    // --- OBTENER ELEMENTOS DEL DOM ---
    const registroLimpiezaModal = document.getElementById('registroLimpiezaModal');
    const modalForm = document.getElementById('formRegistroLimpieza');
    const modalLoader = document.getElementById('modalLoader');
    const successToastEl = document.getElementById('successToast');
    const successToast = successToastEl ? new bootstrap.Toast(successToastEl) : null;

    // Elementos del flujo de registro
    const qrScannerView = document.getElementById('qr-scanner-view');
    const registrationFormView = document.getElementById('registration-form-view');
    const startScanBtn = document.getElementById('start-scan-btn');
    const qrReader = document.getElementById('qr-reader');
    const tomarFotoBtn = document.getElementById('tomar-foto-btn');
    const evidenceInput = document.getElementById('evidence');
    const fotoPreview = document.getElementById('foto-preview');
    const saveBtn = document.getElementById('btn-guardar');

    // Elementos del modal de perfil
    const profileModal = document.getElementById('profileModal');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const profilePicturePreview = document.getElementById('profilePicturePreview');

    // Elementos del header
    const profileDropdownImage = document.querySelector('.dropdown-toggle img');

    let currentZoneName = '';
    let currentZoneCardId = '';
    let html5QrCode = null;

    // --- LÓGICA PARA CARGAR LA FOTO DE PERFIL INICIAL (si existe en localStorage) ---
    const storedProfilePicture = localStorage.getItem('profilePicture');
    if (storedProfilePicture) {
        profilePicturePreview.src = storedProfilePicture;
        profileDropdownImage.src = storedProfilePicture;
    }

    // --- LÓGICA DE FILTROS ---
    const filterButtons = document.querySelectorAll('.filters .btn-filter');
    const zoneCards = document.querySelectorAll('.zone-card-wrapper');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            zoneCards.forEach(card => {
                card.style.display = 'block';
                if (filter !== 'all' && card.getAttribute('data-status') !== filter) {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --- LÓGICA DEL ESCÁNER QR ---
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Código QR leído: ${decodedText}`);
        html5QrCode.stop().then(() => {
            qrScannerView.classList.add('hidden');
            setTimeout(() => {
                registrationFormView.classList.remove('hidden');
                saveBtn.disabled = false;
            }, 300);
        }).catch(err => console.error("Error al detener el escáner.", err));
    }

    startScanBtn.addEventListener('click', function() {
        html5QrCode = new Html5Qrcode("qr-reader");
        startScanBtn.textContent = "Apunte a la cámara...";
        startScanBtn.disabled = true;
        html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess)
        .catch(err => alert("Error al iniciar la cámara. Asegúrate de dar los permisos necesarios."));
    });

    // --- LÓGICA PARA TOMAR FOTO ---
    tomarFotoBtn.addEventListener('click', () => evidenceInput.click());

    evidenceInput.addEventListener('change', function(event) {
        const file = event.target.files [0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                fotoPreview.src = e.target.result;
                fotoPreview.classList.remove('d-none');
                tomarFotoBtn.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> Foto Cargada`;
                tomarFotoBtn.classList.add('btn-success', 'text-white');
            }
            reader.readAsDataURL(file);
        }
    });

    // --- LÓGICA DEL MODAL DE REGISTRO ---
    registroLimpiezaModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        currentZoneName = button.getAttribute('data-zone-name');
        currentZoneCardId = 'zona-' + currentZoneName.toLowerCase().replace(/\s+/g, '-');

        registroLimpiezaModal.querySelector('#modalZoneTitle').textContent = currentZoneName;
        registrationFormView.classList.add('hidden');
        qrScannerView.classList.remove('hidden');
        startScanBtn.textContent = "Iniciar Escáner";
        startScanBtn.disabled = false;
        qrReader.innerHTML = "";
        saveBtn.disabled = true;
        modalForm.reset();
        fotoPreview.classList.add('d-none');
        tomarFotoBtn.innerHTML = `<i class="bi bi-camera-fill me-2"></i> Tomar Foto de Evidencia`;
        tomarFotoBtn.classList.remove('btn-success', 'text-white');
        modalLoader.style.display = 'none';
    });

    registroLimpiezaModal.addEventListener('hide.bs.modal', function () {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.error("Error al detener el escáner al cerrar.", err));
        }
    });

    modalForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!evidenceInput.files [0]) {
            alert('Por favor, toma una foto como evidencia.');
            return;
        }
        modalLoader.style.display = 'flex';
        setTimeout(() => {
            const modalInstance = bootstrap.Modal.getInstance(registroLimpiezaModal);
            modalInstance.hide();
            const zoneCardWrapper = document.getElementById(currentZoneCardId);
            if (zoneCardWrapper) {
                zoneCardWrapper.setAttribute('data-status', 'completed');
                const card = zoneCardWrapper.querySelector('.card-zone');
                const statusBar = card.querySelector('.card-status-bar');
                statusBar.classList.remove('status-pending');
                statusBar.classList.add('status-completed');
                card.querySelector('.card-body').innerHTML = `
                    <div class="zone-icon"><i class="bi bi-building"></i></div>
                    <h5 class="card-title">${currentZoneName}</h5>
                    <p class="card-text text-muted mb-3 small">Registrado: Ahora mismo</p>
                    <div class="completed-check">
                        <i class="bi bi-check-circle-fill"></i> Completado
                    </div>
                `;
            }
            if (successToast) successToast.show();
        }, 1500);
    });

    // --- LÓGICA DEL MODAL DE PERFIL ---
    if (profileModal) {
        profilePicturePreview.addEventListener('click', () => profilePictureInput.click());

        profilePictureInput.addEventListener('change', function(event) {
            const file = event.target.files [0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePicturePreview.setAttribute('src', e.target.result);
                    profileDropdownImage.src = e.target.result; // Actualizar la imagen en el header
                    localStorage.setItem('profilePicture', e.target.result); // Guardar en localStorage
                }
                reader.readAsDataURL(file);
            } else {
                // Si el usuario cancela la selección de archivo, mantener la imagen anterior
                const currentPicture = localStorage.getItem('profilePicture');
                if (currentPicture) {
                    profilePicturePreview.src = currentPicture;
                    profileDropdownImage.src = currentPicture;
                }
            }
        });
    }
});

if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
    .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
    })
    .catch(error => {
        console.log('Fallo en el registro del Service Worker:', error);
    });
});
}

if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
    .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
    })
    .catch(error => {
        console.log('Fallo en el registro del Service Worker:', error);
    });
});
}