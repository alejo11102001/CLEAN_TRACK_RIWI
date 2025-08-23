document.addEventListener('DOMContentLoaded', function () {
    const registroLimpiezaModal = document.getElementById('registroLimpiezaModal');
    const modalForm = document.getElementById('formRegistroLimpieza');
    const modalLoader = document.getElementById('modalLoader');
    const successToastEl = document.getElementById('successToast');
    const successToast = successToastEl ? new bootstrap.Toast(successToastEl) : null;
    
    // Nuevos elementos para la funcionalidad de la foto
    const tomarFotoBtn = document.getElementById('tomar-foto-btn');
    const evidenceInput = document.getElementById('evidence');
    const fotoPreview = document.getElementById('foto-preview');

    let currentZoneName = '';
    let currentZoneCardId = '';

    // Evento que se dispara ANTES de que el modal se muestre
    registroLimpiezaModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        currentZoneName = button.getAttribute('data-zone-name');
        currentZoneCardId = 'zona-' + currentZoneName.toLowerCase().replace(/\s+/g, '-');
        
        const modalTitle = registroLimpiezaModal.querySelector('#modalZoneTitle');
        modalTitle.textContent = currentZoneName;

        // Resetear el formulario y la vista previa
        modalForm.reset();
        fotoPreview.classList.add('d-none');
        fotoPreview.setAttribute('src', '');
        modalLoader.style.display = 'none';
    });

    // ---- NUEVA FUNCIONALIDAD: BOTÓN PARA TOMAR FOTO ----
    tomarFotoBtn.addEventListener('click', function() {
        // Al hacer clic en nuestro botón, activamos el input de archivo oculto
        evidenceInput.click();
    });

    // ---- NUEVA FUNCIONALIDAD: VISTA PREVIA DE LA FOTO ----
    evidenceInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // Creamos una URL temporal para la imagen y la mostramos
            const reader = new FileReader();
            reader.onload = function(e) {
                fotoPreview.setAttribute('src', e.target.result);
                fotoPreview.classList.remove('d-none');
            }
            reader.readAsDataURL(file);
        }
    });

    // ---- FUNCIONALIDAD COMPLETA: GUARDAR Y FINALIZAR ----
    modalForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validar que se haya adjuntado una foto
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
                const zoneFooter = zoneCard.querySelector('.zone-footer');
                zoneFooter.innerHTML = `
                    <span class="badge status-completed">COMPLETADO</span>
                    <span class="text-success fs-5"><i class="bi bi-check-circle-fill"></i></span>
                `;
            }

            if (successToast) {
                successToast.show();
            }

        }, 1500);
    });
});