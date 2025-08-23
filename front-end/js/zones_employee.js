document.addEventListener('DOMContentLoaded', function () {
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

    let currentZoneName = '';
    let currentZoneCardId = '';
    let html5QrCode = null;

    // --- LÓGICA DEL ESCÁNER QR ---
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Código QR leído: ${decodedText}`);
        // Aquí puedes añadir una verificación del decodedText contra currentZoneName si lo necesitas
        
        html5QrCode.stop().then(() => {
            qrScannerView.classList.add('d-none'); // Oculta el escáner
            registrationFormView.classList.remove('d-none'); // Muestra el formulario
            saveBtn.disabled = false; // Habilita el botón de guardar
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
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                fotoPreview.src = e.target.result;
                fotoPreview.classList.remove('d-none');
            }
            reader.readAsDataURL(file);
        }
    });

    // --- LÓGICA DEL MODAL Y FORMULARIO ---
    registroLimpiezaModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        currentZoneName = button.getAttribute('data-zone-name');
        currentZoneCardId = 'zona-' + currentZoneName.toLowerCase().replace(/\s+/g, '-');
        
        registroLimpiezaModal.querySelector('#modalZoneTitle').textContent = currentZoneName;

        // Resetea el modal a su estado inicial (Paso 1: Escáner)
        registrationFormView.classList.add('d-none');
        qrScannerView.classList.remove('d-none');
        startScanBtn.textContent = "Iniciar Escáner";
        startScanBtn.disabled = false;
        qrReader.innerHTML = "";
        saveBtn.disabled = true; // Deshabilita el botón de guardar al inicio
        modalForm.reset();
        fotoPreview.classList.add('d-none');
        modalLoader.style.display = 'none';
    });

    registroLimpiezaModal.addEventListener('hide.bs.modal', function () {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.error("Error al detener el escáner al cerrar.", err));
        }
    });

    modalForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!evidenceInput.files[0]) {
            alert('Por favor, toma una foto como evidencia.');
            return;
        }

        modalLoader.style.display = 'flex';

        setTimeout(() => {
            const modalInstance = bootstrap.Modal.getInstance(registroLimpiezaModal);
            modalInstance.hide();

            const zoneCard = document.getElementById(currentZoneCardId);
            if (zoneCard) {
                zoneCard.querySelector('.card').classList.add('card-completed');
                zoneCard.querySelector('.zone-footer').innerHTML = `<span class="badge status-completed">COMPLETADO</span><span class="text-success fs-5"><i class="bi bi-check-circle-fill"></i></span>`;
            }

            if (successToast) successToast.show();
        }, 1500);
    });
});