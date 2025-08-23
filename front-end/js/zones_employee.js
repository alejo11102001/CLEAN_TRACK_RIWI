document.addEventListener('DOMContentLoaded', function () {
    const registroLimpiezaModal = document.getElementById('registroLimpiezaModal');
    const modalForm = document.getElementById('formRegistroLimpieza');
    const modalLoader = document.getElementById('modalLoader');
    const successToastEl = document.getElementById('successToast');
    const successToast = new bootstrap.Toast(successToastEl);
    
    let currentZoneName = '';
    let currentZoneCardId = '';

    // Evento que se dispara ANTES de que el modal se muestre
    registroLimpiezaModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        currentZoneName = button.getAttribute('data-zone-name');
        
        // Generamos un ID para la tarjeta a partir del nombre de la zona
        currentZoneCardId = 'zona-' + currentZoneName.toLowerCase().replace(/\s+/g, '-');
        
        const modalTitle = registroLimpiezaModal.querySelector('#modalZoneTitle');
        modalTitle.textContent = currentZoneName;

        // Reseteamos el formulario y ocultamos el loader por si se quedó visible
        modalForm.reset();
        modalLoader.style.display = 'none';
    });

    // Evento que se dispara al ENVIAR el formulario
    modalForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita que la página se recargue

        // 1. Mostrar la vista de carga
        modalLoader.style.display = 'flex';

        // 2. Simular un proceso de guardado (ej. 1.5 segundos)
        setTimeout(() => {
            // 3. Ocultar el modal
            const modalInstance = bootstrap.Modal.getInstance(registroLimpiezaModal);
            modalInstance.hide();

            // 4. Actualizar la tarjeta de la zona en la página principal
            const zoneCard = document.getElementById(currentZoneCardId);
            if (zoneCard) {
                // Cambiar el borde y fondo
                zoneCard.querySelector('.card').classList.add('card-completed');
                
                // Actualizar el footer de la tarjeta
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