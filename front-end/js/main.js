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
                            <button class="btn btn-sm btn-outline-primary">Editar</button>
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
                    <td class="text-end"><button class="btn btn-sm btn-outline-primary">Editar</button></td>
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
                    <td class="text-end"><button class="btn btn-sm btn-outline-danger">Eliminar</button></td>
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
    if (!localStorage.getItem('authToken')) {
        window.location.href = './index.html'; // Redirige si no hay token
        return;
    }
    
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    function loadView(viewName) {
        mainContent.innerHTML = views[viewName] || '<h2>Contenido no encontrado</h2>';
        
        switch (viewName) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'register':
                renderCleaningRecords();
                break;
            case 'zones':
                renderZones();
                break;
            case 'users':
                renderUsers();
                break;
            case 'allocations':
                renderAllocations();
                break;
            case 'reports':
                // Aquí iría la función para renderizar los reportes
                break;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const view = link.getAttribute('data-view');
            loadView(view);
        });
    });

    // Cargar la vista inicial por defecto
    loadView('dashboard');
});

// Lógica para Cerrar Sesión
logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('authToken');
    window.location.href = './index.html';
});

// --- Lógica para los Formularios de los Modales ---

// Formulario para Crear Nuevo Usuario
document.getElementById('formNuevoUsuario').addEventListener('submit', async (event) => {
    event.preventDefault();
    const userData = {
        names: document.getElementById('nombreUsuario').value,
        lastnames: document.getElementById('apellidoUsuario').value,
        employee_code: document.getElementById('codigoUsuario').value,
        email: document.getElementById('emailUsuario').value,
        shift: document.getElementById('horarioUsuario').value,
        role: document.getElementById('rolUsuario').value,
        temporal_password: document.getElementById('passwordUsuario').value
    };
    try {
        await request('/api/admin/create-user', 'POST', userData);
        bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario')).hide();
        renderUsers(); // Recarga la tabla de usuarios

        Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'El nuevo usuario ha sido creado con éxito.',
            showConfirmButton: false,
            timer: 1500
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Error al crear usuario: ${error.message}`
        });
    }
});

// Formulario para Crear Nueva Zona
document.getElementById('formNuevaZona').addEventListener('submit', async (event) => {
    event.preventDefault();
    const zoneData = {
        name: document.getElementById('nombreZona').value,
        flats: parseInt(document.getElementById('pisoZona').value),
        qr_identifier: document.getElementById('qrIdentifier').value,
        description: document.getElementById('descripcionZona').value,
        photo_url: null
    };
    try {
        await request('/api/zones', 'POST', zoneData);
        bootstrap.Modal.getInstance(document.getElementById('modalNuevaZona')).hide();
        renderZones(); // Recarga la vista de zonas

        Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'La nueva zona ha sido creada con éxito.',
            showConfirmButton: false,
            timer: 1500
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Error al crear la zona: ${error.message}`
        });
    }
});

// Formulario para Crear Nueva Asignación
document.getElementById('formNuevaAsignacion').addEventListener('submit', async (event) => {
    event.preventDefault();
    const assignmentData = {
        users_id: parseInt(document.getElementById('asignacionUsuario').value),
        zones_id: parseInt(document.getElementById('asignacionZona').value)
    };
    try {
        await request('/api/assignments', 'POST', assignmentData);
        bootstrap.Modal.getInstance(document.getElementById('modalNuevaAsignacion')).hide();
        renderAllocations(); // Recarga la tabla de asignaciones

        Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'La nueva asignación ha sido creada con éxito.',
            showConfirmButton: false,
            timer: 1500
        });
    }
    catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Error al crear la asignación: ${error.message}`
        });
    }
});

    // ===================================================================
    // ¡NUEVO CÓDIGO! PARA POBLAR EL MODAL DE ASIGNACIONES
    // ===================================================================
const modalNuevaAsignacion = document.getElementById('modalNuevaAsignacion');

// Esta función se encarga de buscar los datos y llenar los <select>
const populateAssignmentModalDropdowns = async () => {
    const userSelect = document.getElementById('asignacionUsuario');
    const zoneSelect = document.getElementById('asignacionZona');

    // Muestra un estado de "Cargando..."
    userSelect.innerHTML = '<option>Cargando usuarios...</option>';
    zoneSelect.innerHTML = '<option>Cargando zonas...</option>';

    try {
        // Pide a la API la lista de empleados y zonas al mismo tiempo
        const [employees, zones] = await Promise.all([
            request('/api/employees'), // Endpoint que devuelve solo empleados
            request('/api/zones')
        ]);

        // Limpia los selectores
        userSelect.innerHTML = '<option selected disabled value="">Seleccionar usuario...</option>';
        zoneSelect.innerHTML = '<option selected disabled value="">Seleccionar zona...</option>';

        // Llena el selector de usuarios
        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.names} ${employee.lastnames}`;
            userSelect.appendChild(option);
        });

        // Llena el selector de zonas
        zones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.id;
            option.textContent = zone.name;
            zoneSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error al poblar los selectores:', error);
        userSelect.innerHTML = '<option>Error al cargar</option>';
        zoneSelect.innerHTML = '<option>Error al cargar</option>';
    }
};

// Escucha el evento que se dispara JUSTO ANTES de que el modal se muestre
modalNuevaAsignacion.addEventListener('show.bs.modal', () => {
    populateAssignmentModalDropdowns();
});