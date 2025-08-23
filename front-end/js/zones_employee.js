document.addEventListener('DOMContentLoaded', function () {
    const registroLimpiezaModal = document.getElementById('registroLimpiezaModal');
    const modalForm = document.getElementById('formRegistroLimpieza');
    const successToastEl = document.getElementById('successToast');
    const successToast = successToastEl ? new bootstrap.Toast(successToastEl) : null;
    
    // Elementos del nuevo flujo de escaneo
    const qrScannerContainer = document.getElementById('qr-scanner-container');
    const registrationFormContainer = document.getElementById('registration-form-container');
    const startScanBtn = document.getElementById('start-scan-btn');
    const qrReader = document.getElementById('qr-reader');

    let currentZoneName = '';
    let html5QrCode = null; // Variable para la instancia del escáner

    // Función que se ejecuta cuando se escanea un QR exitosamente
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Código QR leído = ${decodedText}`);
        
        // Aquí iría la lógica para verificar si el QR es el correcto.
        // Por ahora, asumimos que cualquier QR es válido.
        
        // Detener el escáner
        html5QrCode.stop().then(() => {
            // Ocultar la sección del escáner y mostrar el formulario
            qrScannerContainer.classList.add('d-none');
            registrationFormContainer.classList.remove('d-none');
        }).catch(err => {
            console.error("Error al detener el escáner.", err);
        });
    }

    // Función para iniciar el escaneo
    startScanBtn.addEventListener('click', function() {
        // Inicializar el lector de QR
        html5QrCode = new Html5Qrcode("qr-reader");
        startScanBtn.textContent = "Apunte a la cámara...";
        startScanBtn.disabled = true;

        // Pedir permiso para la cámara y empezar a escanear
        html5QrCode.start(
            { facingMode: "environment" }, // Usa la cámara trasera
            {
                fps: 10, // Frames por segundo
                qrbox: { width: 250, height: 250 } // Tamaño del cuadro de escaneo
            },
            onScanSuccess, // Función a llamar si tiene éxito
            (errorMessage) => { 
                // console.error(errorMessage); // Se puede ignorar el error si no encuentra QR
            }
        ).catch((err) => {
            console.error("No se pudo iniciar el escáner.", err);
            alert("Error al iniciar la cámara. Asegúrate de dar los permisos necesarios.");
            startScanBtn.textContent = "Iniciar Escáner";
            startScanBtn.disabled = false;
        });
    });

    // Evento que se dispara ANTES de que el modal se muestre
    registroLimpiezaModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        currentZoneName = button.getAttribute('data-zone-name');
        
        const modalTitle = registroLimpiezaModal.querySelector('#modalZoneTitle');
        modalTitle.textContent = currentZoneName;

        // Resetear el modal a su estado inicial (mostrar escáner, ocultar formulario)
        registrationFormContainer.classList.add('d-none');
        qrScannerContainer.classList.remove('d-none');
        startScanBtn.textContent = "Iniciar Escáner";
        startScanBtn.disabled = false;
        qrReader.innerHTML = ""; // Limpiar el visor del escáner
        modalForm.reset();
    });

    // Evento para detener la cámara si el modal se cierra
    registroLimpiezaModal.addEventListener('hide.bs.modal', function () {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.error("Error al detener el escáner al cerrar modal.", err));
        }
    });

    // El evento de 'submit' del formulario (lógica de carga y actualización) se mantiene igual
    modalForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        // Lógica para el loader, actualizar la tarjeta y mostrar el toast...
    });
});