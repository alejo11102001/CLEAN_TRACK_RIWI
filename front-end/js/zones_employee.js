import { request, requestWithFile } from './api.js';

let html5QrCode = null;
let expectedZoneIdForScan = null; 

// --- FUNCIÓN PARA CARGAR EL PERFIL DEL EMPLEADO ---
const loadEmployeeProfile = async () => {
    try {
        const user = await request('/api/me');
        document.getElementById('employeeName').textContent = `${user.names} ${user.lastnames}`;
        document.getElementById('greeting').innerHTML = `¡Hola de nuevo, ${user.names}! 👋`;
        document.getElementById('profileName').value = `${user.names} ${user.lastnames}`;
        document.getElementById('profileEmail').value = user.email;
        document.getElementById('profileCode').value = user.employee_code || 'N/A';
        document.getElementById('profileSchedule').value = user.shift || 'N/A';
    } catch (error) {
        console.error("Error al cargar el perfil:", error);
    }
};

// --- FUNCIÓN PARA CARGAR LAS ZONAS ASIGNADAS ---
const loadAssignedZones = async () => {
    const container = document.getElementById('assignedZonesContainer');
    container.innerHTML = '<p class="text-muted">Cargando zonas...</p>';
    try {
        const zones = await request('/api/employee/zones');
        container.innerHTML = '';

        if (zones.length === 0) {
            container.innerHTML = '<div class="col"><p class="text-muted">No tienes zonas asignadas.</p></div>';
            document.getElementById('taskSummary').textContent = 'No hay tareas para hoy.';
            return;
        }

        let pendingCount = 0;
        zones.forEach(zone => {
            if (zone.status === 'Pendiente') pendingCount++;
            const statusClass = zone.status === 'Pendiente' ? 'pendiente' : 'completado-hoy';
            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4 zone-card-wrapper" data-status="${statusClass}" id="assignment-card-${zone.assignment_id}">
                    <div class="card card-zone h-100">
                        ${zone.photo ? 
                            `<img src="${zone.photo}" class="card-img-top zone-image" alt="Foto de ${zone.name}">` : 
                            '<div class="zone-image-placeholder"><i class="bi bi-camera fs-1 text-muted"></i></div>'
                        }
                        <div class="card-status-bar ${statusClass === 'pendiente' ? 'status-pending' : 'status-completed'}"></div>
                        <div class="card-body d-flex flex-column">
                            <div class="zone-icon"><i class="bi bi-geo-alt-fill"></i></div>
                            <h5 class="card-title">${zone.name}</h5>
                            <p class="card-text text-muted mb-3 small">Piso: ${zone.flats}</p>
                            <div class="mt-auto">
                                ${zone.status === 'Pendiente' ?
                                    `<button type="button" class="btn btn-sm btn-riwi-primary stretched-link" 
                                        data-bs-toggle="modal" data-bs-target="#registroLimpiezaModal" 
                                        data-zone-id="${zone.code}" 
                                        data-numeric-zone-id="${zone.zone_id}" 
                                        data-zone-name="${zone.name}" 
                                        data-assignment-id="${zone.assignment_id}" >
                                        Registrar Limpieza
                                    </button>` :
                                    `<div class="completed-check"><i class="bi bi-check-circle-fill"></i> Completado</div>`
                                }
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        document.getElementById('taskSummary').textContent = `Tienes ${pendingCount} zona(s) pendiente(s) para hoy.`;
        setupFilters();
    } catch (error) {
        console.error("Error al cargar las zonas:", error);
        container.innerHTML = '<div class="col"><p class="text-danger">No se pudieron cargar tus zonas.</p></div>';
    }
};

// --- FUNCIÓN PARA LA LÓGICA DE FILTROS ---
const setupFilters = () => {
    const filterButtons = document.querySelectorAll('.filters .btn-filter');
    const zoneCards = document.querySelectorAll('.zone-card-wrapper');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            zoneCards.forEach(card => {
                card.style.display = (filter === 'all' || card.getAttribute('data-status') === filter) ? 'block' : 'none';
            });
        });
    });
};

// --- LÓGICA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(error => {
                console.log('Fallo en el registro del Service Worker:', error);
            });
        });
    }

    if (!localStorage.getItem('authToken')) {
        window.location.href = './index.html';
        return;
    }

    loadEmployeeProfile();
    loadAssignedZones();

    const registroModalEl = document.getElementById('registroLimpiezaModal');
    const qrScannerView = document.getElementById('qr-scanner-view');
    const registrationFormView = document.getElementById('registration-form-view');
    const startScanBtn = document.getElementById('start-scan-btn');
    const saveBtn = document.getElementById('btn-guardar');
    const cleaningForm = document.getElementById('formRegistroLimpieza');

    // Lógica de foto de perfil
    const profilePicturePreview = document.getElementById('profilePicturePreview');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const profileImage = document.getElementById('profileImage');
    const storedProfilePicture = localStorage.getItem('profilePicture');
    if (storedProfilePicture) {
        profilePicturePreview.src = storedProfilePicture;
        profileImage.src = storedProfilePicture;
    }
    profilePicturePreview.addEventListener('click', () => profilePictureInput.click());
    profilePictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                profilePicturePreview.src = imageUrl;
                profileImage.src = imageUrl;
                localStorage.setItem('profilePicture', imageUrl);
                Swal.fire('¡Éxito!', 'Foto de perfil actualizada.', 'success');
            };
            reader.readAsDataURL(file);
        }
    });

    // Lógica del Escáner QR
    const onScanSuccess = (decodedText, decodedResult) => {
        html5QrCode.stop().catch(err => console.error("Fallo al detener el escáner.", err));
        
        try {
            const scannedUrl = new URL(decodedText);
            const scannedZoneId = scannedUrl.searchParams.get('zone');
            
            if (scannedZoneId && scannedZoneId === expectedZoneIdForScan) {
                Swal.fire('¡Validado!', 'QR correcto. Procede con el registro.', 'success');
                qrScannerView.classList.add('d-none');
                registrationFormView.classList.remove('d-none');
                saveBtn.disabled = false;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'QR Incorrecto',
                    text: `Este QR no corresponde a la zona seleccionada.`,
                });
                startScanBtn.textContent = "Iniciar Escáner";
                startScanBtn.disabled = false;
            }
        } catch (e) {
            Swal.fire('QR Inválido', 'El código escaneado no es un QR de zona válido.', 'error');
            startScanBtn.textContent = "Iniciar Escáner";
            startScanBtn.disabled = false;
        }
    };

    startScanBtn.addEventListener('click', () => {
        html5QrCode = new Html5Qrcode("qr-reader");
        startScanBtn.textContent = "Apuntando a la cámara...";
        startScanBtn.disabled = true;
        html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess)
            .catch(err => Swal.fire("Error al iniciar la cámara", "Por favor, otorga los permisos necesarios.", "error"));
    });

    // Lógica para configurar y resetear el modal
    registroModalEl.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        const zoneName = button.dataset.zoneName;
        const zoneIdForValidation = button.dataset.zoneId;
        const numericZoneIdForDb = button.dataset.numericZoneId; // <-- CAMBIO CLAVE 1: Leer el ID numérico
        const assignmentId = button.dataset.assignmentId;

        expectedZoneIdForScan = zoneIdForValidation;

        // Input oculto para 'assignmentId'
        let hiddenAssignmentInput = cleaningForm.querySelector('input[name="assignmentId"]');
        if (!hiddenAssignmentInput) {
            hiddenAssignmentInput = document.createElement('input');
            hiddenAssignmentInput.type = 'hidden';
            hiddenAssignmentInput.name = 'assignmentId';
            cleaningForm.appendChild(hiddenAssignmentInput);
        }
        hiddenAssignmentInput.value = assignmentId;

        registroModalEl.querySelector('#modalZoneTitle').textContent = zoneName;
        
        // Input oculto para 'zoneId'
        let hiddenZoneInput = cleaningForm.querySelector('input[name="zoneId"]');
        if (!hiddenZoneInput) {
            hiddenZoneInput = document.createElement('input');
            hiddenZoneInput.type = 'hidden';
            hiddenZoneInput.name = 'zoneId';
            cleaningForm.appendChild(hiddenZoneInput);
        }
        hiddenZoneInput.value = numericZoneIdForDb; // <-- CAMBIO CLAVE 2: Usar el ID numérico para el formulario

        // Resetear la vista del modal
        qrScannerView.classList.remove('d-none');
        registrationFormView.classList.add('d-none');
        saveBtn.disabled = true;
        startScanBtn.textContent = "Iniciar Escáner";
        startScanBtn.disabled = false;
        cleaningForm.reset();
    });
    
    registroModalEl.addEventListener('hide.bs.modal', () => {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.error("Fallo al detener el escáner al cerrar.", err));
        }
    });

    // Lógica para enviar el formulario
    cleaningForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        saveBtn.disabled = true;
        
        const formData = new FormData(cleaningForm);
        const assignmentIdToUpdate = formData.get('assignmentId');
        
        try {
            await requestWithFile('/api/cleaning-records', formData);
            bootstrap.Modal.getInstance(registroModalEl).hide();
            
            await Swal.fire('¡Registro Exitoso!', 'La limpieza ha sido registrada correctamente.', 'success');
            // Recargar las zonas para ver el estado actualizado
            loadAssignedZones();
        } catch (error) {
            Swal.fire('Error', `No se pudo guardar el registro: ${error.message}`, 'error');
        } finally {
            saveBtn.disabled = false;
        }
    });
    
    // Lógica para cerrar sesión
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = './index.html';
        });
    }
});