import { request } from './api.js';
const logoutButton = document.getElementById('logoutButton');

// ===================================================================
// 1. PLANTILLAS HTML DE LAS VISTAS
// ===================================================================
const views = {
    // ========== VISTA DASHBOARD ==========
    dashboard: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Dashboard</h1>
        </div>
        <div class="row g-4 mb-4">
            <div class="col-md-6 col-lg-3"><div class="card shadow-sm h-100"><div class="card-body d-flex align-items-center"><i class="bi bi-check2-circle fs-1 text-success me-3"></i><div><h5 class="card-title text-muted">Limpiezas Hoy</h5><p id="stats-limpiezas-hoy" class="card-text fs-2 fw-bold">0</p></div></div></div></div>
            <div class="col-md-6 col-lg-3"><div class="card shadow-sm h-100"><div class="card-body d-flex align-items-center"><i class="bi bi-exclamation-triangle fs-1 text-warning me-3"></i><div><h5 class="card-title text-muted">Zonas Pendientes</h5><p id="stats-zonas-pendientes" class="card-text fs-2 fw-bold">0</p></div></div></div></div>
            <div class="col-md-6 col-lg-3"><div class="card shadow-sm h-100"><div class="card-body d-flex align-items-center"><i class="bi bi-people fs-1 text-info me-3"></i><div><h5 class="card-title text-muted">Colaboradores</h5><p id="stats-colaboradores" class="card-text fs-2 fw-bold">0</p></div></div></div></div>
            <div class="col-md-6 col-lg-3"><div class="card shadow-sm h-100"><div class="card-body d-flex align-items-center"><i class="bi bi-file-earmark-text fs-1 text-secondary me-3"></i><div><h5 class="card-title text-muted">Reportes Mes</h5><p id="stats-reportes-mes" class="card-text fs-2 fw-bold">0</p></div></div></div></div>
        </div>
        <div class="row g-4"><div class="col-lg-7"><div class="card shadow-sm"><div class="card-header fw-bold">Actividad de la Semana</div><div class="card-body"><canvas id="activityChart" height="150"></canvas></div></div></div><div class="col-lg-5"><div class="card shadow-sm"><div class="card-header fw-bold">Registros Recientes</div><ul id="lista-registros-recientes" class="list-group list-group-flush"><li class="list-group-item text-muted">Cargando...</li></ul></div></div></div>
    `,
    // ========== VISTA REGISTROS ==========
    register: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Registros de Limpieza</h1>
        </div>
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th scope="col">Zona</th>
                                <th scope="col">Colaborador</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Fecha y Hora</th>
                                <th scope="col">Evidencia</th>
                                <th scope="col">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody id="cleaningRecordsTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    // ========== VISTA ZONAS ==========
    zones: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Gestión de Zonas</h1>
            <button type="button" class="btn btn-riwi-primary d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#modalNuevaZona">
                <i class="bi bi-plus-lg me-2"></i> Nueva Zona
            </button>
        </div>
        <div id="zonas-grid-container" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>
    `,
    // ========== VISTA USUARIOS ==========
    users: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Gestión de Usuarios</h1>
            <button type="button" class="btn btn-riwi-primary d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                <i class="bi bi-plus-lg me-2"></i> Nuevo Usuario
            </button>
        </div>
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th scope="col">Nombre Completo</th>
                                <th scope="col">Email</th>
                                <th scope="col">Rol</th>
                                <th scope="col" class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-usuarios-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    // ========== VISTA ASIGNACIONES ==========
    allocations: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Gestión de Asignaciones</h1>
            <button type="button" class="btn btn-riwi-primary d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#modalNuevaAsignacion">
                <i class="bi bi-plus-lg me-2"></i> Nueva Asignación
            </button>
        </div>
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th scope="col">Colaborador</th>
                                <th scope="col">Zona Asignada</th>
                                <th scope="col" class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-asignaciones-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    // ========== VISTA REPORTES ==========
    reports: `
        <div class="d-flex justify-content-between align-items-center mb-4"><h1 class="h2 fw-bold">Generador de Reportes</h1></div>
        <div class="card shadow-sm mb-4"><div class="card-body"><form class="row g-3 align-items-end"><div class="col-md-4"><label for="reportType" class="form-label">Tipo de Reporte</label><select id="reportType" class="form-select"></select></div><div class="col-md-4"><label for="dateRange" class="form-label">Rango de Fechas</label><input type="date" class="form-select" id="dateRange"></div><div class="col-md-4"><button type="submit" class="btn btn-riwi-primary w-100">Generar Reporte</button></div></form></div></div>
        <div class="card shadow-sm"><div class="card-header fw-bold">Reportes Generados</div><ul id="lista-reportes-generados" class="list-group list-group-flush"><li class="list-group-item text-muted">No hay reportes generados.</li></ul></div>
    `
};

// ===================================================================
// 2. FUNCIONES PARA CARGAR Y PINTAR DATOS DE LA API
// ===================================================================

async function renderDashboard() {
    try {
        const [users, zones, records] = await Promise.all([
            request('/api/users'),
            request('/api/zones'),
            request('/api/cleaning-records')
        ]);

        document.getElementById('stats-colaboradores').textContent = users.length;
        document.getElementById('stats-zonas-pendientes').textContent = zones.length; // Lógica de pendientes es más compleja
        document.getElementById('stats-reportes-mes').textContent = records.length;
        
        const recentList = document.getElementById('lista-registros-recientes');
        recentList.innerHTML = '';
        if (records.length === 0) {
            recentList.innerHTML = '<li class="list-group-item text-muted">No hay actividad reciente.</li>';
        } else {
            records.slice(0, 5).forEach(rec => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = `${rec.zone_name} - por ${rec.employee_name}`;
                recentList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
    }
}

async function renderCleaningRecords() {
    const tableBody = document.getElementById('cleaningRecordsTableBody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Cargando...</td></tr>';
    try {
        const records = await request('/api/cleaning-records');
        tableBody.innerHTML = '';
        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay registros.</td></tr>';
            return;
        }
        records.forEach(rec => {
            tableBody.innerHTML += `
                <tr>
                    <td>${rec.zone_name}</td>
                    <td>${rec.employee_name}</td>
                    <td><span class="badge bg-info">${rec.cleaning_type}</span></td>
                    <td>${new Date(rec.cleaned_at).toLocaleString()}</td>
                    <td><button class="btn btn-sm btn-outline-secondary" onclick="window.open('${rec.evidence}', '_blank')">Ver</button></td>
                    <td>${rec.observations || '-'}</td>
                </tr>
            `;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar.</td></tr>`;
    }
}

async function renderZones() {
    const container = document.getElementById('zonas-grid-container');
    container.innerHTML = '<p class="text-center text-muted">Cargando...</p>';
    try {
        const zones = await request('/api/zones');
        container.innerHTML = '';
        if (zones.length === 0) {
            container.innerHTML = '<div class="col"><p class="text-center text-muted">No hay zonas definidas.</p></div>';
            return;
        }
        zones.forEach(zone => {
            container.innerHTML += `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${zone.name}</h5>
                            <p class="card-text">Piso: ${zone.flats}</p>
                            <small class="text-muted">ID QR: ${zone.qr_identifier}</small>
                        </div>
                        <div class="card-footer text-end">
                            <button class="btn btn-sm btn-outline-primary edit-zone-btn" data-zone-id="${zone.id}">Editar</button>
                            <button class="btn btn-sm btn-outline-danger delete-zone-btn" data-zone-id="${zone.id}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<div class="col"><p class="text-center text-danger">Error al cargar.</p></div>`;
    }
}

async function renderUsers() {
    const tableBody = document.getElementById('tabla-usuarios-body');
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Cargando...</td></tr>';
    try {
        const users = await request('/api/users');
        tableBody.innerHTML = '';
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay usuarios.</td></tr>';
            return;
        }
        users.forEach(user => {
            tableBody.innerHTML += `
                <tr>
                    <td>${user.names} ${user.lastnames}</td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-success">${user.rol}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary edit-user-btn" data-user-id="${user.id}">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-user-btn" data-user-id="${user.id}">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error al cargar.</td></tr>`;
    }
}

async function renderAllocations() {
    const tableBody = document.getElementById('tabla-asignaciones-body');
    tableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Cargando...</td></tr>';
    try {
        const allocations = await request('/api/assignments');
        tableBody.innerHTML = '';
        if (allocations.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay asignaciones.</td></tr>';
            return;
        }
        allocations.forEach(alloc => {
            tableBody.innerHTML += `
                <tr>
                    <td>${alloc.employee_name}</td>
                    <td>${alloc.zone_name}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary edit-assignment-btn" data-assignment-id="${alloc.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-assignment-btn" data-assignment-id="${alloc.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Error al cargar.</td></tr>`;
    }
}

// ===================================================================
// 3. LÓGICA PRINCIPAL DE LA APLICACIÓN (SPA)
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    // ---- VERIFICACIÓN INICIAL ----
    if (!localStorage.getItem('authToken')) {
        window.location.href = './index.html';
        return;
    }
    
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    // ---- FUNCIÓN PARA CARGAR VISTAS ----
    function loadView(viewName) {
        mainContent.innerHTML = views[viewName] || '<h2>Contenido no encontrado</h2>';
        
        switch (viewName) {
            case 'dashboard': renderDashboard(); break;
            case 'register': renderCleaningRecords(); break;
            case 'zones': renderZones(); break;
            case 'users': renderUsers(); break;
            case 'allocations': renderAllocations(); break;
        }
    }

    // ---- NAVEGACIÓN PRINCIPAL ----
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const view = link.getAttribute('data-view');
            loadView(view);
        });
    });

    // ---- MANEJADOR UNIFICADO PARA EL FORMULARIO DE USUARIO (CREAR Y EDITAR) ----
    const handleUserFormSubmit = async (event) => {
        event.preventDefault();
        const form = document.getElementById('formNuevoUsuario');
        const editingId = form.dataset.editingId;

        const userData = {
            names: document.getElementById('nombreUsuario').value,
            lastnames: document.getElementById('apellidoUsuario').value,
            employee_code: document.getElementById('codigoUsuario').value,
            email: document.getElementById('emailUsuario').value,
            shift: document.getElementById('horarioUsuario').value,
            role: document.getElementById('rolUsuario').value,
        };
        
        // Solo añade la contraseña si estamos creando un nuevo usuario
        if (!editingId) {
            userData.temporal_password = document.getElementById('passwordUsuario').value;
        }

        try {
            if (editingId) {
                // MODO EDICIÓN (PUT)
                await request(`/api/admin/users/${editingId}`, 'PUT', userData);
                Swal.fire('¡Actualizado!', 'El usuario ha sido actualizado.', 'success');
            } else {
                // MODO CREACIÓN (POST)
                await request('/api/admin/create-user', 'POST', userData);
                Swal.fire('¡Creado!', 'El nuevo usuario ha sido creado.', 'success');
            }
            
            bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario')).hide();
            renderUsers(); // Recargamos la tabla de usuarios
        } catch (error) {
            Swal.fire('Error', `No se pudo guardar el usuario: ${error.message}`, 'error');
        }
    };
    
    // ---- MANEJADOR DE EVENTOS GENERAL PARA CLICS (EVENT DELEGATION) ----
    document.body.addEventListener('click', async (event) => {
        const target = event.target.closest('button'); // Busca el botón más cercano al clic
        if (!target) return; // Si no se hizo clic en un botón, no hagas nada

        // Si se hace clic en el botón de eliminar usuario
        if (target.matches('.delete-user-btn')) {
            const userId = target.dataset.userId;
            Swal.fire({
                title: '¿Estás seguro?', text: "¡No podrás revertir esto!", icon: 'warning',
                showCancelButton: true, confirmButtonColor: '#d33', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, ¡eliminar!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await request(`/api/admin/users/${userId}`, 'DELETE');
                        Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
                        renderUsers();
                    } catch (error) {
                        Swal.fire('Error', `No se pudo eliminar el usuario: ${error.message}`, 'error');
                    }
                }
            });
        }
        
        // Si se hace clic en el botón de editar usuario
        if (target.matches('.edit-user-btn')) {
            const userId = target.dataset.userId;
            try {
                const user = await request(`/api/users/${userId}`);
                
                document.getElementById('modalNuevoUsuarioLabel').textContent = 'Editar Usuario';
                document.getElementById('nombreUsuario').value = user.names;
                document.getElementById('apellidoUsuario').value = user.lastnames;
                document.getElementById('emailUsuario').value = user.email;
                document.getElementById('codigoUsuario').value = user.employee_code || '';
                document.getElementById('horarioUsuario').value = user.shift || '';
                document.getElementById('rolUsuario').value = user.rol;
                document.getElementById('formNuevoUsuario').dataset.editingId = userId;
                
                document.getElementById('password-field-group').style.display = 'none';
                
                new bootstrap.Modal(document.getElementById('modalNuevoUsuario')).show();
            } catch (error) {
                Swal.fire('Error', 'No se pudieron cargar los datos del usuario para editar.', 'error');
            }
        }

        // --- LÓGICA PARA ZONAS (AÑADIR ESTO) ---
        if (target.matches('.delete-zone-btn')) {
            const zoneId = target.dataset.zoneId;
            Swal.fire({
                title: '¿Estás seguro de eliminar esta zona?', text: "¡No podrás revertir esto!", icon: 'warning',
                showCancelButton: true, confirmButtonColor: '#d33', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, ¡eliminar!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await request(`/api/zones/${zoneId}`, 'DELETE');
                        Swal.fire('¡Eliminada!', 'La zona ha sido eliminada.', 'success');
                        renderZones();
                    } catch (error) {
                        Swal.fire('Error', `No se pudo eliminar la zona: ${error.message}`, 'error');
                    }
                }
            });
        }

        if (target.matches('.edit-zone-btn')) {
            const zoneId = target.dataset.zoneId;
            try {
                const zone = await request(`/api/zones/${zoneId}`);
                
                // Rellenar el modal de zonas
                document.getElementById('modalNuevaZonaLabel').textContent = 'Editar Zona';
                document.getElementById('nombreZona').value = zone.name;
                document.getElementById('pisoZona').value = zone.flats;
                document.getElementById('qrIdentifier').value = zone.qr_identifier;
                document.getElementById('descripcionZona').value = zone.description;
                document.getElementById('formNuevaZona').dataset.editingId = zoneId;
                
                new bootstrap.Modal(document.getElementById('modalNuevaZona')).show();
            } catch (error) {
                Swal.fire('Error', 'No se pudieron cargar los datos de la zona.', 'error');
            }
        }
            // --- LÓGICA PARA ASIGNACIONES (AÑADIR ESTO) ---
        if (target.matches('.delete-assignment-btn')) {
            const assignmentId = target.dataset.assignmentId;
            Swal.fire({
                title: '¿Eliminar asignación?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
                showCancelButton: true, confirmButtonColor: '#d33', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, eliminar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await request(`/api/assignments/${assignmentId}`, 'DELETE');
                        Swal.fire('¡Eliminada!', 'La asignación ha sido eliminada.', 'success');
                        renderAllocations();
                    } catch (error) {
                        Swal.fire('Error', `No se pudo eliminar: ${error.message}`, 'error');
                    }
                }
            });
        }
    });

    // =====================================================
    // 1. ABRIR MODAL PARA CREAR O EDITAR
    // =====================================================
    document.addEventListener('click', async (event) => {
        const target = event.target;

        // ==== Caso EDITAR ====
        if (target.matches('.edit-assignment-btn')) {
            const assignmentId = target.dataset.assignmentId;
            try {
                // Carga datos de la asignación
                const assignment = await request(`/api/assignments/${assignmentId}`);

                // Poblar dropdowns
                await populateAssignmentModalDropdowns(assignment.users_id, assignment.zones_id);

                // Configurar modal en modo edición
                const form = document.getElementById('formNuevaAsignacion');
                form.dataset.editingId = assignmentId;

                document.getElementById('modalNuevaAsignacionLabel').textContent = 'Editar Asignación';

                new bootstrap.Modal(document.getElementById('modalNuevaAsignacion')).show();
            } catch (error) {
                Swal.fire('Error', 'No se pudieron cargar los datos de la asignación.', 'error');
            }
        }

        // ==== Caso CREAR ====
        if (target.matches('.new-assignment-btn')) {
            try {
                // Poblar dropdowns vacíos
                await populateAssignmentModalDropdowns();

                // Configurar modal en modo creación
                const form = document.getElementById('formNuevaAsignacion');
                delete form.dataset.editingId;

                document.getElementById('modalNuevaAsignacionLabel').textContent = 'Nueva Asignación';

                new bootstrap.Modal(document.getElementById('modalNuevaAsignacion')).show();
            } catch (error) {
                Swal.fire('Error', 'No se pudo preparar el formulario.', 'error');
            }
        }
    });


    // =====================================================
    // 2. SUBMIT DEL FORMULARIO (crear o actualizar)
    // =====================================================
    document.getElementById('formNuevaAsignacion').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const editingId = form.dataset.editingId;

        const assignmentData = {
            users_id: document.getElementById('asignacionUsuario').value,
            zones_id: document.getElementById('asignacionZona').value,
        };

        try {
            if (editingId) {
                // === Actualizar ===
                await request(`/api/assignments/${editingId}`, 'PUT', assignmentData);
                Swal.fire('¡Actualizada!', 'La asignación ha sido actualizada.', 'success');
            } else {
                // === Crear ===
                await request('/api/assignments', 'POST', assignmentData);
                Swal.fire('¡Creada!', 'La nueva asignación ha sido creada.', 'success');
            }

            bootstrap.Modal.getInstance(document.getElementById('modalNuevaAsignacion')).hide();
            renderAllocations();
        } catch (error) {
            Swal.fire('Error', `No se pudo guardar la asignación: ${error.message}`, 'error');
        }
    });


    // --- CONECTA EL MANEJADOR AL FORMULARIO ---
    document.getElementById('formNuevoUsuario').addEventListener('submit', handleUserFormSubmit);
    
    // --- RESETEA EL MODAL CUANDO SE CIERRA ---
    document.getElementById('modalNuevoUsuario').addEventListener('hidden.bs.modal', () => {
        const form = document.getElementById('formNuevoUsuario');
        form.reset();
        delete form.dataset.editingId;
        document.getElementById('modalNuevoUsuarioLabel').textContent = 'Crear Nuevo Usuario';
        document.getElementById('password-field-group').style.display = 'block';
    });
    
    // --- MANEJADOR UNIFICADO PARA EL SUBMIT DEL FORMULARIO DE ZONA (CREAR Y EDITAR) ---
    document.getElementById('formNuevaZona').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const editingId = form.dataset.editingId;

        const zoneData = {
            name: document.getElementById('nombreZona').value,
            flats: parseInt(document.getElementById('pisoZona').value),
            qr_identifier: document.getElementById('qrIdentifier').value,
            description: document.getElementById('descripcionZona').value,
        };

        try {
            if (editingId) {
                await request(`/api/zones/${editingId}`, 'PUT', zoneData);
                Swal.fire('¡Actualizada!', 'La zona ha sido actualizada.', 'success');
            } else {
                await request('/api/zones', 'POST', zoneData);
                Swal.fire('¡Creada!', 'La nueva zona ha sido creada.', 'success');
            }
            bootstrap.Modal.getInstance(document.getElementById('modalNuevaZona')).hide();
            renderZones();
        } catch (error) {
            Swal.fire('Error', `No se pudo guardar la zona: ${error.message}`, 'error');
        }
    });

    // --- RESETEAR EL MODAL DE ZONA CUANDO SE CIERRA ---
    document.getElementById('modalNuevaZona').addEventListener('hidden.bs.modal', () => {
        const form = document.getElementById('formNuevaZona');
        form.reset();
        delete form.dataset.editingId;
        document.getElementById('modalNuevaZonaLabel').textContent = 'Crear Nueva Zona';
    });

        // --- LÓGICA PARA POBLAR Y RESETEAR EL MODAL DE ASIGNACIONES ---
    const modalNuevaAsignacion = document.getElementById('modalNuevaAsignacion');
    
    // Función para poblar los selectores del modal de asignaciones
    const populateAssignmentModalDropdowns = async (selectedUserId = null, selectedZoneId = null) => {
        const userSelect = document.getElementById('asignacionUsuario');
        const zoneSelect = document.getElementById('asignacionZona');
        userSelect.innerHTML = '<option>Cargando usuarios...</option>';
        zoneSelect.innerHTML = '<option>Cargando zonas...</option>';

        try {
            const [employees, zones] = await Promise.all([
                request('/api/employees'),
                request('/api/zones')
            ]);
            userSelect.innerHTML = '<option disabled value="">Seleccionar usuario...</option>';
            zoneSelect.innerHTML = '<option disabled value="">Seleccionar zona...</option>';

            employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = `${employee.names} ${employee.lastnames}`;
                userSelect.appendChild(option);
            });
            zones.forEach(zone => {
                const option = document.createElement('option');
                option.value = zone.id;
                option.textContent = zone.name;
                zoneSelect.appendChild(option);
            });

            // Si estamos editando, pre-seleccionamos los valores
            if (selectedUserId) userSelect.value = selectedUserId;
            if (selectedZoneId) zoneSelect.value = selectedZoneId;

        } catch (error) {
            console.error('Error al poblar los selectores:', error);
        }
    };
    
    // Escucha el evento para poblar el modal antes de que se muestre
    modalNuevaAsignacion.addEventListener('show.bs.modal', () => {
        // Solo pobla si no estamos editando (en modo edición se llama desde el botón)
        if (!document.getElementById('formNuevaAsignacion').dataset.editingId) {
            populateAssignmentModalDropdowns();
        }
    });

    // Resetea el modal cuando se cierra
    modalNuevaAsignacion.addEventListener('hidden.bs.modal', () => {
        const form = document.getElementById('formNuevaAsignacion');
        form.reset();
        delete form.dataset.editingId;
        document.getElementById('modalNuevaAsignacionLabel').textContent = 'Crear Nueva Asignación';
    });
    
    // --- CARGA INICIAL ---
    loadView('dashboard');
});