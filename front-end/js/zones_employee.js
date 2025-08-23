document.addEventListener('DOMContentLoaded', function () {
    const registroLimpiezaModal = document.getElementById('registroLimpiezaModal');
    const modalForm = document.getElementById('formRegistroLimpieza');
    const modalLoader = document.getElementById('modalLoader'); // Referencia al loader
    const successToastEl = document.getElementById('successToast');
    const successToast = new bootstrap.Toast(successToastEl);
    
    // Elementos del flujo de escaneo
    const qrScannerContainer = document.getElementById('qr-scanner-container');
    const registrationFormContainer = document.getElementById('registration-form-container');
    const startScanBtn = document.getElementById('start-scan-btn');
    const qrReader = document.getElementById('qr-reader');

    let currentZoneName = '';
    let currentZoneCardId = '';
    let html5QrCode = null;

    // Función que se ejecuta cuando se escanea un QR exitosamente
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Código QR leído = ${decodedText}`);
        html5QrCode.stop().then(() => {
            qrScannerContainer.classList.add('d-none');
            registrationFormContainer.classList.remove('d-none');
        }).catch(err => console.error("Error al detener el escáner.", err));
    }

    // Función para iniciar el escaneo
    startScanBtn.addEventListener('click', function() {
        html5QrCode = new Html5Qrcode("qr-reader");
        startScanBtn.textContent = "Apunte a la cámara...";
        startScanBtn.disabled = true;

        html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess)
        .catch(err => alert("Error al iniciar la cámara. Asegúrate de dar los permisos necesarios."));
    });

    // Evento que se dispara ANTES de que el modal se muestre
    registroLimpiezaModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        currentZoneName = button.getAttribute('data-zone-name');
        currentZoneCardId = 'zona-' + currentZoneName.toLowerCase().replace(/\s+/g, '-');
        
        const modalTitle = registroLimpiezaModal.querySelector('#modalZoneTitle');
        modalTitle.textContent = currentZoneName;

        // Resetear el modal
        registrationFormContainer.classList.add('d-none');
        qrScannerContainer.classList.remove('d-none');
        startScanBtn.textContent = "Iniciar Escáner";
        startScanBtn.disabled = false;
        qrReader.innerHTML = "";
        modalForm.reset();
        modalLoader.style.display = 'none'; // Asegurarse que el loader esté oculto al abrir
    });

    // Evento para detener la cámara si el modal se cierra
    registroLimpiezaModal.addEventListener('hide.bs.modal', function () {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.error("Error al detener el escáner al cerrar modal.", err));
        }
    });

    // --- LÓGICA DEL BOTÓN "GUARDAR Y FINALIZAR" (COMPLETA) ---
    modalForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir recarga de la página

        // 1. Mostrar la vista de carga
        modalLoader.style.display = 'flex';

        // 2. Simular un proceso de guardado (1.5 segundos)
        setTimeout(() => {
            // 3. Ocultar el modal
            const modalInstance = bootstrap.Modal.getInstance(registroLimpiezaModal);
            modalInstance.hide();

            // 4. Actualizar la tarjeta de la zona en la página principal
            const zoneCard = document.getElementById(currentZoneCardId);
            if (zoneCard) {
                zoneCard.querySelector('.card').classList.add('card-completed');
                const zoneFooter = zoneCard.querySelector('.zone-footer');
                zoneFooter.innerHTML = `
                    <span class="badge status-completed">COMPLETADO</span>
                    <span class="text-success fs-5"><i class="bi bi-check-circle-fill"></i></span>
                `;
            }

            // 5. Mostrar notificación de éxito (toast)
            successToast.show();

        }, 1500);
    });
});