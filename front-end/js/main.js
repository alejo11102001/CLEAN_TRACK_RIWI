import {
    request
} from './api.js';
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
                                <th scope="col">Estado</th>
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
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h1 class="h2 fw-bold">Gestión de Asignaciones</h1>
            <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-riwi-primary d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#modalNuevaAsignacion">
                    <i class="bi bi-plus-lg me-2"></i> Nueva Asignación
                </button>
                <button id="auto-assign-btn" type="button" class="btn btn-info text-white d-flex align-items-center">
                    <i class="bi bi-shuffle me-2"></i> Asignar Aleatoriamente
                </button>
                <button id="clear-assignments-btn" type="button" class="btn btn-danger d-flex align-items-center">
                    <i class="bi bi-trash me-2"></i> Eliminar Todas
                </button>
            </div>
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

    // ========== VISTA GENERADOR QR ==========
    qrGenerator: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Generador de Códigos QR</h1>
            <button id="print-qr-btn" type="button" class="btn btn-riwi-primary d-flex align-items-center">
                <i class="bi bi-printer me-2"></i> Imprimir Todos
            </button>
        </div>
        <div id="qr-grid-container" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            <p class="text-center text-muted col-12">Cargando zonas...</p>
        </div>
    `,

    // ========== VISTA REPORTES ==========
    reports: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Generador de Reportes</h1>
            <button id="downloadReportBtn" class="btn btn-success d-none" type="button">
                <i class="bi bi-file-earmark-excel me-2"></i>Descargar Excel
            </button>
        </div>
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <form id="reportFiltersForm" class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label for="reportType" class="form-label">Tipo de Reporte</label>
                        <select id="reportType" class="form-select">
                            <option value="general">Reporte General de Limpieza</option>
                            <option value="by_employee">Rendimiento por Colaborador</option>
                        </select>
                    </div>
                    <div class="col-md-3" id="employeeFilterContainer" style="display: none;">
                        <label for="employeeFilter" class="form-label">Colaborador</label>
                        <select id="employeeFilter" class="form-select"></select>
                    </div>
                    <div class="col-md-3">
                        <label for="dateRangeStart" class="form-label">Desde</label>
                        <input type="date" class="form-control" id="dateRangeStart">
                    </div>
                    <div class="col-md-2">
                        <label for="dateRangeEnd" class="form-label">Hasta</label>
                        <input type="date" class="form-control" id="dateRangeEnd">
                    </div>
                    <div class="col-md-12 text-end mt-3">
                        <button type="submit" class="btn btn-primary w-auto">
                            <i class="bi bi-search me-2"></i>Generar Reporte
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div class="card shadow-sm">
            <div class="card-header fw-bold">
                Resultados del Reporte
            </div>
            <div class="card-body">
                <div id="reportResultContainer" class="table-responsive">
                    <p class="text-muted text-center">Aún no se ha generado ningún reporte. Por favor, selecciona los filtros y haz clic en "Generar Reporte".</p>
                </div>
            </div>
        </div>
    `
};

// ===================================================================
// 2. FUNCIONES DE RENDERIZADO
// ===================================================================

async function renderDashboard() {
    try {
        const [users, zones, records] = await Promise.all([
            request('/api/users'),
            request('/api/zones'),
            request('/api/cleaning-records')
        ]);

        document.getElementById('stats-colaboradores').textContent = users.length;
        document.getElementById('stats-zonas-pendientes').textContent = zones.length;
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
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Cargando...</td></tr>';

    try {
        const users = await request('/api/users');
        tableBody.innerHTML = '';

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay usuarios.</td></tr>';
            return;
        }

        users.forEach(user => {
            const statusBadge = user.rol === 'Empleado' ?
                `<span class="badge bg-${user.is_active ? 'success' : 'secondary'}">${user.is_active ? 'Activo' : 'Inactivo'}</span>` :
                '';

            tableBody.innerHTML += `
                <tr>
                    <td>${user.names} ${user.lastnames}</td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-primary">${user.rol}</span></td>
                    <td>${statusBadge}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary edit-user-btn" data-user-id="${user.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-user-btn" data-user-id="${user.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar.</td></tr>`;
    }
}

async function renderQrGeneratorView() {
    const qrGridContainer = document.getElementById('qr-grid-container');
    qrGridContainer.innerHTML = '<p class="text-center text-muted col-12">Cargando zonas...</p>';

    try {
        const zones = await request('/api/zones');
        qrGridContainer.innerHTML = '';

        if (zones.length === 0) {
            qrGridContainer.innerHTML = '<div class="col"><p class="text-center text-muted">No se encontraron zonas.</p></div>';
            return;
        }

        zones.forEach(zone => {
            const baseUrl = 'http://127.0.0.1:5501/front-end/dashboard_empleado.html';
            const dynamicUrl = `${baseUrl}?zone=${zone.qr_identifier}`;
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

            cardWrapper.innerHTML = `
                <div class="card qr-card h-100" id="qr-card-${zone.id}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${zone.name}</h5>
                        <div class="qr-code-container d-flex justify-content-center" id="qr-${zone.id}"></div>
                        <p class="text-muted small mt-2">${zone.qr_identifier}</p>
                    </div>
                    <div class="card-footer text-center no-print">
                        <button class="btn btn-sm btn-outline-secondary print-single-qr-btn" data-card-id="qr-card-${zone.id}">
                            <i class="bi bi-printer"></i> Imprimir
                        </button>
                    </div>
                </div>
            `;

            qrGridContainer.appendChild(cardWrapper);
            const qrContainer = document.getElementById(`qr-${zone.id}`);
            new QRCode(qrContainer, {
                text: dynamicUrl,
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        });
    } catch (error) {
        console.error("Error al generar los QRs:", error);
        qrGridContainer.innerHTML = '<div class="col"><p class="text-center text-danger">Error al cargar las zonas.</p></div>';
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
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Error al cargar las asignaciones.</td></tr>`;
    }
}

async function renderReports() {
    const reportTypeSelect = document.getElementById('reportType');
    const employeeFilterContainer = document.getElementById('employeeFilterContainer');
    const employeeSelect = document.getElementById('employeeFilter');
    const filtersForm = document.getElementById('reportFiltersForm');
    const resultContainer = document.getElementById('reportResultContainer');
    const downloadBtn = document.getElementById('downloadReportBtn');

    const toggleEmployeeFilter = () => {
        if (reportTypeSelect.value === 'by_employee') {
            employeeFilterContainer.style.display = 'block';
            employeeSelect.required = true;
        } else {
            employeeFilterContainer.style.display = 'none';
            employeeSelect.required = false;
        }
    };

    try {
        const users = await request('/api/users');
        employeeSelect.innerHTML = '<option value="">Todos los colaboradores</option>';
        users.forEach(user => {
            if (user.rol.toLowerCase() !== 'admin') {
                employeeSelect.innerHTML += `<option value="${user.id}">${user.names} ${user.lastnames}</option>`;
            }
        });
    } catch (error) {
        console.error("Error al cargar empleados para el filtro:", error);
        employeeSelect.innerHTML = '<option value="">Error al cargar</option>';
    }

    reportTypeSelect.addEventListener('change', toggleEmployeeFilter);

    filtersForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        resultContainer.innerHTML = `<p class="text-muted text-center">Generando reporte...</p>`;
        downloadBtn.classList.add('d-none');

        const params = new URLSearchParams();
        params.append('reportType', reportTypeSelect.value);

        const startDate = document.getElementById('dateRangeStart').value;
        const endDate = document.getElementById('dateRangeEnd').value;

        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (reportTypeSelect.value === 'by_employee' && employeeSelect.value) {
            params.append('employeeId', employeeSelect.value);
        }

        try {
            const reportData = await request(`/api/reports?${params.toString()}`);

            if (!reportData || reportData.length === 0) {
                resultContainer.innerHTML = `<p class="text-muted text-center">No se encontraron resultados.</p>`;
                return;
            }

            let tableHTML = '<table class="table table-hover align-middle">';

            if (reportTypeSelect.value === 'by_employee') {
                tableHTML += `
                    <thead class="table-light">
                        <tr>
                            <th>Colaborador</th>
                            <th>Total Limpiezas</th>
                            <th>Primera Limpieza</th>
                            <th>Última Limpieza</th>
                        </tr>
                    </thead>
                `;
                tableHTML += '<tbody>';
                reportData.forEach(row => {
                    tableHTML += `
                        <tr>
                            <td>${row.employee_name}</td>
                            <td><span class="badge bg-info">${row.total_cleanings}</span></td>
                            <td>${new Date(row.first_cleaning).toLocaleString()}</td>
                            <td>${new Date(row.last_cleaning).toLocaleString()}</td>
                        </tr>
                    `;
                });
            } else { // Reporte General
                tableHTML += `
                    <thead class="table-light">
                        <tr>
                            <th>Zona</th>
                            <th>Colaborador</th>
                            <th>Tipo</th>
                            <th>Fecha y Hora</th>
                        </tr>
                    </thead>
                `;
                tableHTML += '<tbody>';
                reportData.forEach(row => {
                    tableHTML += `
                        <tr>
                            <td>${row.zone_name}</td>
                            <td>${row.employee_name}</td>
                            <td>${row.cleaning_type}</td>
                            <td>${new Date(row.cleaned_at).toLocaleString()}</td>
                        </tr>
                    `;
                });
            }

            tableHTML += '</tbody></table>';
            resultContainer.innerHTML = tableHTML;
            downloadBtn.classList.remove('d-none');

            downloadBtn.onclick = () => {
                console.log("Datos para descargar:", reportData);
                Swal.fire('Función en desarrollo', 'La exportación a Excel se implementará pronto.', 'info');
            };

        } catch (error) {
            console.error("Error al generar el reporte:", error);
            resultContainer.innerHTML = `<p class="text-danger text-center">Error al generar el reporte: ${error.message}</p>`;
        }
    });
    toggleEmployeeFilter();
}

// ===================================================================
// 3. LÓGICA DE ASIGNACIÓN
// ===================================================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function assignZonesRandomly() {
    const button = document.getElementById('auto-assign-btn');
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Asignando...';

    try {
        const [employees, zones] = await Promise.all([
            request('/api/employees'),
            request('/api/zones')
        ]);

        if (employees.length === 0) {
            throw new Error('No hay colaboradores activos para asignar zonas.');
        }
        if (zones.length === 0) {
            throw new Error('No hay zonas creadas para ser asignadas.');
        }

        shuffleArray(zones);

        const newAssignments = [];
        let employeeIndex = 0;
        zones.forEach(zone => {
            newAssignments.push({
                users_id: employees[employeeIndex].id,
                zones_id: zone.id
            });
            employeeIndex = (employeeIndex + 1) % employees.length;
        });

        const existingAssignmentsCount = await request('/api/assignments').then(a => a.length);
        const {
            isConfirmed
        } = await Swal.fire({
            title: '¿Confirmar Asignación Aleatoria?',
            html: `Esto <b>eliminará las ${existingAssignmentsCount} asignaciones existentes</b> y creará <strong>${newAssignments.length} nuevas</strong> para los <strong>${employees.length} empleados activos</strong>.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, ¡proceder!',
            cancelButtonText: 'Cancelar'
        });

        if (isConfirmed) {
            Swal.fire({
                title: 'Procesando...',
                didOpen: () => Swal.showLoading(),
                allowOutsideClick: false
            });
            await request('/api/assignments/clear', 'DELETE');
            await request('/api/assignments/bulk', 'POST', {
                assignments: newAssignments
            });
            Swal.fire('¡Éxito!', 'Las zonas han sido reasignadas aleatoriamente.', 'success');
            renderAllocations();
        }
    } catch (error) {
        Swal.fire('Error', `${error.message}`, 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="bi bi-shuffle me-2"></i> Asignar Aleatoriamente';
    }
}

// ===================================================================
// 4. LÓGICA PRINCIPAL DE LA APLICACIÓN (SPA)
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('authToken')) {
        window.location.href = './index.html';
        return;
    }

    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    async function loadAdminInfo() {
        try {
            const admin = await request('/api/admin/profile');
            const fullName = `${admin.names} ${admin.lastnames}`;
            const adminNameDisplay = document.getElementById('admin-name-display');
            if (adminNameDisplay) {
                adminNameDisplay.textContent = fullName;
            }
        } catch (error) {
            console.error('Error al cargar la información del administrador:', error);
            const adminNameDisplay = document.getElementById('admin-name-display');
            if (adminNameDisplay) {
                adminNameDisplay.textContent = "Admin";
            }
        }
    }

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
            case 'qrGenerator':
                renderQrGeneratorView();
                break;
            case 'allocations':
                renderAllocations();
                break;
            case 'reports':
                renderReports();
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

    const cleanupPrintClasses = () => {
        document.body.classList.remove('printing-single-card');
        const printedCard = document.querySelector('.is-printing');
        if (printedCard) {
            printedCard.classList.remove('is-printing');
        }
    };
    window.onafterprint = cleanupPrintClasses;

    document.body.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        // --- Lógica de botones de asignación ---
        if (button.matches('#auto-assign-btn')) {
            assignZonesRandomly();
        }

        if (button.matches('#clear-assignments-btn')) {
            Swal.fire({
                title: '¿Eliminar todas las asignaciones?',
                text: "Esta acción no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar todo'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await request('/api/assignments/clear', 'DELETE');
                        Swal.fire('¡Eliminadas!', 'Todas las asignaciones han sido eliminadas.', 'success');
                        renderAllocations();
                    } catch (error) {
                        Swal.fire('Error', `No se pudo completar la operación: ${error.message}`, 'error');
                    }
                }
            });
        }

        if (button.matches('.delete-assignment-btn')) {
            const assignmentId = button.dataset.assignmentId;
            Swal.fire({
                title: '¿Eliminar esta asignación?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar'
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

        if (button.matches('.edit-assignment-btn')) {
            const assignmentId = button.dataset.assignmentId;
            try {
                const assignment = await request(`/api/assignments/${assignmentId}`);
                await populateAssignmentModalDropdowns(assignment);
                const form = document.getElementById('formNuevaAsignacion');
                form.dataset.editingId = assignmentId;
                document.getElementById('modalNuevaAsignacionLabel').textContent = 'Editar Asignación';
                new bootstrap.Modal(document.getElementById('modalNuevaAsignacion')).show();
            } catch (error) {
                Swal.fire('Error', 'No se pudieron cargar los datos de la asignación.', 'error');
            }
        }

        // --- Lógica de botones de usuario ---
        if (button.matches('.edit-user-btn')) {
            const userId = button.dataset.userId;
            try {
                const user = await request(`/api/users/${userId}`);
                document.getElementById('modalNuevoUsuarioLabel').textContent = 'Editar Usuario';
                document.getElementById('nombreUsuario').value = user.names;
                document.getElementById('apellidoUsuario').value = user.lastnames;
                document.getElementById('emailUsuario').value = user.email;
                document.getElementById('rolUsuario').value = user.rol;

                document.getElementById('rolUsuario').dispatchEvent(new Event('change'));

                if (user.rol === 'Empleado') {
                    document.getElementById('codigoUsuario').value = user.employee_code || '';
                    document.getElementById('horarioUsuario').value = user.shift || '';
                    document.getElementById('estadoUsuario').value = user.is_active ? 'Activo' : 'Inactivo';
                }

                document.getElementById('formNuevoUsuario').dataset.editingId = userId;
                document.getElementById('password-field-group').style.display = 'none';
                document.getElementById('passwordUsuario').required = false;

                new bootstrap.Modal(document.getElementById('modalNuevoUsuario')).show();
            } catch (error) {
                Swal.fire('Error', 'No se pudieron cargar los datos del usuario.', 'error');
            }
        }

        if (button.matches('.delete-user-btn')) {
            const userId = button.dataset.userId;
            Swal.fire({
                title: '¿Estás seguro?',
                text: "¡No podrás revertir esto!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Sí, ¡eliminar!'
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

        // --- Lógica de botones de zona ---
        if (button.matches('.edit-zone-btn')) {
            const zoneId = button.dataset.zoneId;
            try {
                const zone = await request(`/api/zones/${zoneId}`);
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

        if (button.matches('.delete-zone-btn')) {
            const zoneId = button.dataset.zoneId;
            Swal.fire({
                title: '¿Estás seguro de eliminar esta zona?',
                text: "¡No podrás revertir esto!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Sí, ¡eliminar!'
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

        // --- Lógica de impresión ---
        if (button.matches('.print-single-qr-btn')) {
            cleanupPrintClasses();
            const cardId = button.dataset.cardId;
            const cardToPrint = document.getElementById(cardId);
            if (cardToPrint) {
                document.body.classList.add('printing-single-card');
                cardToPrint.classList.add('is-printing');
                window.print();
            }
        }

        if (button.matches('#print-qr-btn')) {
            cleanupPrintClasses();
            window.print();
        }
    });

    // --- Lógica de Modales ---

    document.getElementById('formNuevoUsuario').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const editingId = form.dataset.editingId;
        const userData = {
            names: document.getElementById('nombreUsuario').value,
            lastnames: document.getElementById('apellidoUsuario').value,
            email: document.getElementById('emailUsuario').value,
            rol: document.getElementById('rolUsuario').value,
        };
        if (userData.rol === 'Empleado') {
            userData.employee_code = document.getElementById('codigoUsuario').value;
            userData.shift = document.getElementById('horarioUsuario').value;
            userData.is_active = document.getElementById('estadoUsuario').value === 'Activo';
        }
        if (!editingId) {
            userData.password = document.getElementById('passwordUsuario').value;
        }
        try {
            const url = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users';
            const method = editingId ? 'PUT' : 'POST';
            await request(url, method, userData);
            Swal.fire('¡Guardado!', 'El usuario ha sido guardado.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario')).hide();
            renderUsers();
        } catch (error) {
            Swal.fire('Error', `No se pudo guardar el usuario: ${error.message}`, 'error');
        }
    });

    document.getElementById('rolUsuario').addEventListener('change', function() {
        const employeeFields = document.getElementById('employee-fields');
        const esEmpleado = this.value === 'Empleado';
        employeeFields.style.display = esEmpleado ? 'block' : 'none';
        document.getElementById('codigoUsuario').required = esEmpleado;
        document.getElementById('horarioUsuario').required = esEmpleado;
    });

    document.getElementById('modalNuevoUsuario').addEventListener('hidden.bs.modal', () => {
        const form = document.getElementById('formNuevoUsuario');
        form.reset();
        delete form.dataset.editingId;
        document.getElementById('modalNuevoUsuarioLabel').textContent = 'Crear Nuevo Usuario';
        document.getElementById('password-field-group').style.display = 'block';
        document.getElementById('passwordUsuario').required = true;
        document.getElementById('employee-fields').style.display = 'none';
        document.getElementById('rolUsuario').dispatchEvent(new Event('change'));
    });

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

    document.getElementById('modalNuevaZona').addEventListener('hidden.bs.modal', () => {
        const form = document.getElementById('formNuevaZona');
        form.reset();
        delete form.dataset.editingId;
        document.getElementById('modalNuevaZonaLabel').textContent = 'Crear Nueva Zona';
    });

    const populateAssignmentModalDropdowns = async (editingAssignment = null) => {
        const userSelect = document.getElementById('asignacionUsuario');
        const zoneSelect = document.getElementById('asignacionZona');
        userSelect.innerHTML = '<option>Cargando...</option>';
        zoneSelect.innerHTML = '<option>Cargando...</option>';
        try {
            const [employees, zones, existingAssignments] = await Promise.all([
                request('/api/employees'),
                request('/api/zones'),
                request('/api/assignments')
            ]);
            const assignedZoneIds = existingAssignments.map(a => a.zones_id);
            userSelect.innerHTML = '<option selected disabled value="">Seleccionar colaborador...</option>';
            employees.forEach(e => {
                userSelect.innerHTML += `<option value="${e.id}">${e.names} ${e.lastnames}</option>`;
            });
            zoneSelect.innerHTML = '<option selected disabled value="">Seleccionar zona...</option>';
            zones.forEach(z => {
                const isAssigned = assignedZoneIds.includes(z.id);
                const isTheOneBeingEdited = editingAssignment && z.id === editingAssignment.zones_id;
                if (!isAssigned || isTheOneBeingEdited) {
                    zoneSelect.innerHTML += `<option value="${z.id}">${z.name}</option>`;
                }
            });
            if (editingAssignment) {
                userSelect.value = editingAssignment.users_id;
                zoneSelect.value = editingAssignment.zones_id;
            }
        } catch (error) {
            console.error('Error al poblar selectores:', error);
            userSelect.innerHTML = '<option>Error</option>';
            zoneSelect.innerHTML = '<option>Error</option>';
        }
    };

    const modalNuevaAsignacion = document.getElementById('modalNuevaAsignacion');
    modalNuevaAsignacion.addEventListener('show.bs.modal', (event) => {
        if (event.relatedTarget) {
            delete document.getElementById('formNuevaAsignacion').dataset.editingId;
            document.getElementById('modalNuevaAsignacionLabel').textContent = 'Crear Nueva Asignación';
            populateAssignmentModalDropdowns();
        }
    });
    modalNuevaAsignacion.addEventListener('hidden.bs.modal', () => {
        const form = document.getElementById('formNuevaAsignacion');
        form.reset();
        delete form.dataset.editingId;
    });

    document.getElementById('formNuevaAsignacion').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const editingId = form.dataset.editingId;
        const userId = document.getElementById('asignacionUsuario').value;
        const zoneId = document.getElementById('asignacionZona').value;
        if (!userId || !zoneId) {
            Swal.fire('Campos incompletos', 'Por favor, selecciona un colaborador y una zona.', 'warning');
            return;
        }
        try {
            const allAssignments = await request('/api/assignments');
            const isZoneAlreadyAssigned = allAssignments.some(
                (assign) => assign.zones_id == zoneId && assign.id != editingId
            );
            if (isZoneAlreadyAssigned) {
                Swal.fire('Zona Ocupada', 'La zona seleccionada ya ha sido asignada.', 'error');
                return;
            }
            const assignmentData = { users_id: userId, zones_id: zoneId };
            const url = editingId ? `/api/assignments/${editingId}` : '/api/assignments';
            const method = editingId ? 'PUT' : 'POST';
            await request(url, method, assignmentData);
            Swal.fire('¡Guardado!', `La asignación ha sido ${editingId ? 'actualizada' : 'creada'}.`, 'success');
            bootstrap.Modal.getInstance(modalNuevaAsignacion).hide();
            renderAllocations();
        } catch (error) {
            Swal.fire('Error', `No se pudo guardar la asignación: ${error.message}`, 'error');
        }
    });

    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
            const icon = sidebarToggle.querySelector('i');
            icon.classList.toggle('bi-arrow-bar-left');
            icon.classList.toggle('bi-arrow-bar-right');
        });
    }

    loadAdminInfo();
    loadView('dashboard');
});

logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('authToken');
    window.location.href = './index.html';
});