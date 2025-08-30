import {request} from './api.js';
import { requestWithFile } from './api.js';
const logoutButton = document.getElementById('logoutButton');

// ===================================================================
// 1. PLANTILLAS HTML Y CONFIGURACIÓN ESTÁTICA
// ===================================================================

const views = {
    // ========== VISTA DASHBOARD (ACTUALIZADA) ==========
    dashboard: `
        <div class="mb-4">
            <h1 class="h2 fw-bold">Dashboard</h1>
            <p class="text-muted">Resumen general del estado de limpieza.</p>
        </div>
        <div class="row g-4 mb-4">
            <div class="col-md-6 col-lg-3">
                <div class="card shadow-sm h-100 border-start border-success border-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title text-muted fw-normal mb-2">Limpiezas Hoy</h5>
                                <span id="stats-limpiezas-hoy" class="h2 fw-bold text-dark">0</span>
                            </div>
                            <div class="avatar-sm flex-shrink-0">
                                <span class="avatar-title bg-success-subtle text-success rounded-3">
                                    <i class="bi bi-check-circle fs-3"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="card shadow-sm h-100 border-start border-warning border-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title text-muted fw-normal mb-2">Zonas Pendientes</h5>
                                <span id="stats-zonas-pendientes" class="h2 fw-bold text-dark">0</span>
                            </div>
                            <div class="avatar-sm flex-shrink-0">
                                <span class="avatar-title bg-warning-subtle text-warning rounded-3">
                                    <i class="bi bi-hourglass-split fs-3"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="card shadow-sm h-100 border-start border-info border-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title text-muted fw-normal mb-2">Colaboradores</h5>
                                <span id="stats-colaboradores" class="h2 fw-bold text-dark">0</span>
                            </div>
                            <div class="avatar-sm flex-shrink-0">
                                <span class="avatar-title bg-info-subtle text-info rounded-3">
                                    <i class="bi bi-person-workspace fs-3"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="card shadow-sm h-100 border-start border-secondary border-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title text-muted fw-normal mb-2">Limpiezas Mes</h5>
                                <span id="stats-reportes-mes" class="h2 fw-bold text-dark">0</span>
                            </div>
                            <div class="avatar-sm flex-shrink-0">
                                <span class="avatar-title bg-secondary-subtle text-secondary rounded-3">
                                    <i class="bi bi-calendar-check fs-3"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row g-4">
            <div class="col-lg-7">
                <div class="card shadow-sm h-100">
                    <div class="card-header fw-bold">Actividad de la Semana</div>
                    <div class="card-body">
                        <canvas id="activityChart" height="150"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="card shadow-sm h-100">
                    <div class="card-header fw-bold">Registros Recientes</div>
                    <ul id="lista-registros-recientes" class="list-group list-group-flush">
                        <li class="list-group-item text-muted">Cargando...</li>
                    </ul>
                </div>
            </div>
        </div>
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

    // ========== VISTA ZONAS (CRUD) ==========
    zones: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Gestión de Zonas</h1>
            <button type="button" class="btn btn-riwi-primary d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#modalNuevaZona">
                <i class="bi bi-plus-lg me-2"></i> Nueva Zona
            </button>
        </div>
        <div id="zonas-grid-container" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>
    `,
    
    // ========== VISTA MONITOR DE ZONAS (MAPA) - INTEGRADA ==========
    mapMonitor: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h2 fw-bold">Monitor de Zonas en Tiempo Real</h1>
            <div class="btn-group" role="group" aria-label="Selección de piso">
                <button type="button" class="btn btn-outline-primary active floor-selector" data-floor="1">Piso 1</button>
                <button type="button" class="btn btn-outline-primary floor-selector" data-floor="2">Piso 2</button>
                <button type="button" class="btn btn-outline-primary floor-selector" data-floor="3">Piso 3</button>
            </div>
        </div>
        <div class="card shadow-sm">
            <div class="card-body">
                <div id="map-container">
                    <img id="map-background" src="" alt="Mapa del piso" />
                    <div id="map-overlay-container"></div>
                </div>
            </div>
        </div>
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

// Objeto de mapeo de SVG a ID de zona - INTEGRADO
const zoneSvgMapping = {
    "overlay-p1-z1": 1, "overlay-p1-z2": 3, "overlay-p1-z3": 5, "overlay-p1-z4": 2, "overlay-p1-z5": 4, "overlay-p1-z6": 6,
    "overlay-p2-z1": 7, "overlay-p2-z2": 8, "overlay-p2-z3": 9, "overlay-p2-z4": 10, "overlay-p2-z5": 11,
    "overlay-p3-z1": 12, "overlay-p3-z2": 14, "overlay-p3-z3": 13, "overlay-p3-z4": 15
};

// ===================================================================
// 2. FUNCIONES DE RENDERIZADO
// ===================================================================

async function renderDashboard() {
    try {
        // 1. Peticiones a los endpoints correctos del dashboard
        const [stats, activity, recentRecords] = await Promise.all([
            request('/api/dashboard/stats'),
            request('/api/dashboard/activity'),
            request('/api/dashboard/records')
        ]);

        // 2. Poblar las tarjetas de estadísticas con datos del backend
        document.getElementById('stats-limpiezas-hoy').textContent = stats.cleaningsToday || '0';
        document.getElementById('stats-zonas-pendientes').textContent = stats.pendingZones || '0';
        document.getElementById('stats-colaboradores').textContent = stats.collaborators || '0';
        document.getElementById('stats-reportes-mes').textContent = stats.cleaningsMonth || '0';

        // 3. Poblar la lista de registros recientes
        const recentList = document.getElementById('lista-registros-recientes');
        recentList.innerHTML = ''; // Limpiar la lista

        if (recentRecords.length === 0) {
            recentList.innerHTML = '<li class="list-group-item text-muted">No hay actividad reciente.</li>';
        } else {
            recentRecords.forEach(record => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                // Creando el contenido del item de la lista
                listItem.innerHTML = `
                    <div>
                        <span class="fw-bold">${record.zone_name}</span>
                        <small class="d-block text-muted">por ${record.names || 'N/A'}</small>
                    </div>
                    <small>${new Date(record.cleaned_at).toLocaleDateString()}</small>
                `;
                recentList.appendChild(listItem);
            });
        }

        // 4. Lógica para renderizar el gráfico de actividad semanal
        const activityChartCtx = document.getElementById('activityChart').getContext('2d');

        // Mapear los días de la semana para asegurar el orden correcto
        const weekDaysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const chartData = Array(7).fill(0);

        activity.forEach(item => {
            const dayIndex = weekDaysOrder.indexOf(item.day.trim());
            if (dayIndex !== -1) {
                chartData[dayIndex] = item.total;
            }
        });

        // Comprobar si ya existe una instancia del gráfico para destruirla antes de crear una nueva
        if (window.myActivityChart instanceof Chart) {
            window.myActivityChart.destroy();
        }

        // Crear la nueva instancia del gráfico
        window.myActivityChart = new Chart(activityChartCtx, {
            type: 'bar',
            data: {
                labels: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                datasets: [{
                    label: 'Limpiezas por Día',
                    data: chartData,
                    backgroundColor: 'rgba(2, 119, 155, 0.6)',
                    borderColor: 'rgba(2, 119, 155, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
        document.getElementById('main-content').innerHTML = `<div class="alert alert-danger">No se pudieron cargar los datos del dashboard. Error: ${error.message}</div>`;
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
            const evidenceButtonHTML = rec.evidence ?
                `<button type="button" class="btn btn-sm btn-outline-secondary view-evidence-btn" 
                        data-bs-toggle="modal" 
                        data-bs-target="#evidenceModal" 
                        data-image-url="${rec.evidence}"
                        data-zone-name="${rec.zone_name}">
                    Ver
                </button>` :
                `<button class="btn btn-sm btn-outline-secondary" disabled>N/A</button>`;

            tableBody.innerHTML += `
                <tr>
                    <td>${rec.zone_name}</td>
                    <td>${rec.employee_name}</td>
                    <td><span class="badge bg-info">${rec.cleaning_type}</span></td>
                    <td>${new Date(rec.cleaned_at).toLocaleString()}</td>
                    <td>${evidenceButtonHTML}</td>
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
            let statusBadge = '';
            if (user.rol === 'Empleado') {
                statusBadge = `<span class="badge bg-${user.is_active ? 'success' : 'secondary'}">${user.is_active ? 'Activo' : 'Inactivo'}</span>`;
            } else if (user.rol === 'Admin') {
                // Los admins no tienen estado 'inactivo' en este sistema, por lo que siempre están activos.
                statusBadge = `<span class="badge bg-success">Activo</span>`;
            }

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
            new QRCode(document.getElementById(`qr-${zone.id}`), {
                text: dynamicUrl,
                width: 180, height: 180,
                colorDark: "#000000", colorLight: "#ffffff",
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
                tableHTML += `<thead class="table-light"><tr><th>Colaborador</th><th>Total Limpiezas</th><th>Primera Limpieza</th><th>Última Limpieza</th></tr></thead>`;
                tableHTML += '<tbody>';
                reportData.forEach(row => {
                    tableHTML += `<tr><td>${row.employee_name}</td><td><span class="badge bg-info">${row.total_cleanings}</span></td><td>${new Date(row.first_cleaning).toLocaleString()}</td><td>${new Date(row.last_cleaning).toLocaleString()}</td></tr>`;
                });
            } else {
                tableHTML += `<thead class="table-light"><tr><th>Zona</th><th>Colaborador</th><th>Tipo</th><th>Fecha y Hora</th></tr></thead>`;
                tableHTML += '<tbody>';
                reportData.forEach(row => {
                    tableHTML += `<tr><td>${row.zone_name}</td><td>${row.employee_name}</td><td>${row.cleaning_type}</td><td>${new Date(row.cleaned_at).toLocaleString()}</td></tr>`;
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

// ========== FUNCIONES DEL MAPA - INTEGRADAS ==========

function getFloorOverlaySvg(floorNumber) {
    let shapes = '';
    const viewBox = "0 0 1000 700";
    const zoneLayouts = {
        '1': [
            { id: 'overlay-p1-z1', x: 10, y: 10, w: 320, h: 335 }, { id: 'overlay-p1-z2', x: 340, y: 10, w: 320, h: 335 }, { id: 'overlay-p1-z3', x: 670, y: 10, w: 320, h: 335 },
            { id: 'overlay-p1-z4', x: 10, y: 355, w: 320, h: 335 }, { id: 'overlay-p1-z5', x: 340, y: 355, w: 320, h: 335 }, { id: 'overlay-p1-z6', x: 670, y: 355, w: 320, h: 335 },
        ],
        '2': [
            { id: 'overlay-p2-z1', x: 15, y: 15, w: 260, h: 330 }, { id: 'overlay-p2-z2', x: 15, y: 355, w: 260, h: 330 }, { id: 'overlay-p2-z3', x: 285, y: 15, w: 430, h: 670 },
            { id: 'overlay-p2-z4', x: 725, y: 15, w: 260, h: 330 }, { id: 'overlay-p2-z5', x: 725, y: 355, w: 260, h: 330 },
        ],
        '3': [
            { id: 'overlay-p3-z1', x: 15, y: 15, w: 250, h: 330 }, { id: 'overlay-p3-z3', x: 15, y: 355, w: 250, h: 330 },
            { id: 'overlay-p3-z2', x: 275, y: 15, w: 450, h: 670 }, { id: 'overlay-p3-z4', x: 735, y: 15, w: 250, h: 670 },
        ]
    };
    const layout = zoneLayouts[floorNumber];
    if (layout) {
        layout.forEach(zone => {
            shapes += `<g id="${zone.id}"><rect class="zone-shape" x="${zone.x}" y="${zone.y}" width="${zone.w}" height="${zone.h}" rx="15" /><foreignObject x="${zone.x}" y="${zone.y}" width="${zone.w}" height="${zone.h}"><div class="zone-info"><div class="zone-name-wrapper"><span class="zone-name-text"></span></div><div class="zone-bottom-details"><div class="zone-status-wrapper"><span class="status-dot"></span><span class="status-text"></span></div><div class="zone-assigned-wrapper"><i class="bi bi-person-fill"></i><span class="assigned-text"></span></div></div></div></foreignObject></g>`;
        });
    }
    return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${shapes}</svg>`;
}

async function renderZoneMap(floorNumber) {
    const mapContainer = document.getElementById('map-container');
    const bgImage = document.getElementById('map-background');
    const overlayContainer = document.getElementById('map-overlay-container');
    
    overlayContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"></div></div>';
    bgImage.src = "";

    try {
        bgImage.src = `./img/maps/piso${floorNumber}.svg`;
        overlayContainer.innerHTML = getFloorOverlaySvg(floorNumber);
        
        const zonesData = await request('/api/admin/zones');
        const svg = overlayContainer.querySelector('svg');

        if (!svg) throw new Error("No se pudo generar la capa SVG.");

        for (const [svgId, zoneId] of Object.entries(zoneSvgMapping)) {
            const groupElement = svg.getElementById(svgId);
            
            if (groupElement) {
                const zoneInfo = zonesData.find(z => z.id === zoneId);
                
                const shapeElement = groupElement.querySelector('.zone-shape');
                const nameTextElement = groupElement.querySelector('.zone-name-text');
                const statusDotElement = groupElement.querySelector('.status-dot');
                const statusTextElement = groupElement.querySelector('.status-text');
                const assignedTextElement = groupElement.querySelector('.assigned-text');

                if (zoneInfo && shapeElement && nameTextElement && statusDotElement && statusTextElement && assignedTextElement) {
                    const statusClass = zoneInfo.status === 'Completado' ? 'status-completado' : 'status-pendiente';
                    shapeElement.classList.add(statusClass);
                    statusDotElement.classList.add(statusClass);
                    nameTextElement.textContent = zoneInfo.name;
                    statusTextElement.textContent = zoneInfo.status === 'Completado' ? `Completado (${zoneInfo.last_cleaning_type || 'N/A'})` : 'Estado: Pendiente';
                    
                    if (zoneInfo.assigned_employee_name) {
                        assignedTextElement.textContent = zoneInfo.assigned_employee_name;
                    } else {
                        const wrapper = assignedTextElement.closest('.zone-assigned-wrapper');
                        if (wrapper) wrapper.style.display = 'none';
                    }
                }
            }
        }
    } catch (error) {
        mapContainer.innerHTML = `<div class="alert alert-danger">Error al cargar el mapa: ${error.message}</div>`;
        console.error(error);
    }
}

// ===================================================================
// 3. LÓGICA DE ASIGNACIÓN, EVENTOS Y SPA
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
        if (employees.length === 0) throw new Error('No hay colaboradores activos para asignar zonas.');
        if (zones.length === 0) throw new Error('No hay zonas creadas para ser asignadas.');
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
        const { isConfirmed } = await Swal.fire({
            title: '¿Confirmar Asignación Aleatoria?',
            html: `Esto <b>eliminará las ${existingAssignmentsCount} asignaciones existentes</b> y creará <strong>${newAssignments.length} nuevas</strong> para los <strong>${employees.length} empleados activos</strong>.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, ¡proceder!',
            cancelButtonText: 'Cancelar'
        });
        if (isConfirmed) {
            Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
            await request('/api/assignments/clear', 'DELETE');
            await request('/api/assignments/bulk', 'POST', { assignments: newAssignments });
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

// Vincula eventos para el selector de pisos del mapa - INTEGRADO
function attachZoneEventListeners() {
    document.querySelectorAll('.floor-selector').forEach(btn => {
        btn.addEventListener('click', (event) => {
            document.querySelectorAll('.floor-selector').forEach(b => b.classList.remove('active'));
            event.currentTarget.classList.add('active');
            const floor = event.currentTarget.dataset.floor;
            renderZoneMap(floor);
        });
    });
}

// Lógica principal de la aplicación (SPA)
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
            if (adminNameDisplay) adminNameDisplay.textContent = fullName;
        } catch (error) {
            console.error('Error al cargar la información del administrador:', error);
            const adminNameDisplay = document.getElementById('admin-name-display');
            if (adminNameDisplay) adminNameDisplay.textContent = "Admin";
        }
    }

    function loadView(viewName) {
        mainContent.innerHTML = views[viewName] || '<h2>Contenido no encontrado</h2>';
        switch (viewName) {
            case 'dashboard': renderDashboard(); break;
            case 'register': renderCleaningRecords(); break;
            case 'zones': renderZones(); break;
            case 'mapMonitor': renderZoneMap(1); attachZoneEventListeners(); break; // <-- NUEVO CASE
            case 'users': renderUsers(); break;
            case 'qrGenerator': renderQrGeneratorView(); break;
            case 'allocations': renderAllocations(); break;
            case 'reports': renderReports(); break;
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
        if (printedCard) printedCard.classList.remove('is-printing');
    };
    window.onafterprint = cleanupPrintClasses;

    document.body.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.matches('#auto-assign-btn')) assignZonesRandomly();
        if (button.matches('#clear-assignments-btn')) {
            Swal.fire({
                title: '¿Eliminar todas las asignaciones?', text: "Esta acción no se puede deshacer.", icon: 'warning',
                showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar todo'
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
            Swal.fire({ title: '¿Eliminar esta asignación?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar' }).then(async (result) => {
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

    document.getElementById('formNuevoUsuario').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const editingId = form.dataset.editingId;
        const userData = {
            names: document.getElementById('nombreUsuario').value, lastnames: document.getElementById('apellidoUsuario').value,
            email: document.getElementById('emailUsuario').value, rol: document.getElementById('rolUsuario').value,
        };
        if (userData.rol === 'Empleado') {
            userData.employee_code = document.getElementById('codigoUsuario').value;
            userData.shift = document.getElementById('horarioUsuario').value;
            userData.is_active = document.getElementById('estadoUsuario').value === 'Activo';
        }
        if (!editingId) { userData.password = document.getElementById('passwordUsuario').value; }
        try {
            const url = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users';
            const method = editingId ? 'PUT' : 'POST';
            await request(url, method, userData);
            Swal.fire('¡Guardado!', 'El usuario ha sido guardado.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario')).hide();
            renderUsers();
        } catch (error) { Swal.fire('Error', `No se pudo guardar el usuario: ${error.message}`, 'error'); }
    });

    document.getElementById('rolUsuario').addEventListener('change', function () {
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

    // 1. Crear un objeto FormData a partir del formulario.
    // Esto empaqueta automáticamente todos los campos, INCLUYENDO EL ARCHIVO.
    const formData = new FormData(form);

    try {
        if (editingId) {
            // Lógica para editar (también usa FormData)
            await requestWithFile(`/api/zones/${editingId}`, formData, 'PUT');
            Swal.fire('¡Actualizada!', 'La zona ha sido actualizada.', 'success');
        } else {
            // 2. Usar 'requestWithFile' para enviar el FormData al crear.
            await requestWithFile('/api/zones', formData, 'POST');
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
                request('/api/employees'), request('/api/zones'), request('/api/assignments')
            ]);
            const assignedZoneIds = existingAssignments.map(a => a.zones_id);
            userSelect.innerHTML = '<option selected disabled value="">Seleccionar colaborador...</option>';
            employees.forEach(e => { userSelect.innerHTML += `<option value="${e.id}">${e.names} ${e.lastnames}</option>`; });
            zoneSelect.innerHTML = '<option selected disabled value="">Seleccionar zona...</option>';
            zones.forEach(z => {
                const isAssigned = assignedZoneIds.includes(z.id);
                const isTheOneBeingEdited = editingAssignment && z.id === editingAssignment.zones_id;
                if (!isAssigned || isTheOneBeingEdited) { zoneSelect.innerHTML += `<option value="${z.id}">${z.name}</option>`; }
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
            const assignmentData = {
                users_id: userId,
                zones_id: zoneId
            };
            const url = editingId ? `/api/assignments/${editingId}` : '/api/assignments';
            const method = editingId ? 'PUT' : 'POST';
            await request(url, method, assignmentData);
            Swal.fire('¡Guardado!', `La asignación ha sido ${editingId ? 'actualizada' : 'creada'}.`, 'success');
            bootstrap.Modal.getInstance(modalNuevaAsignacion).hide();
            renderAllocations();
        } catch (error) { Swal.fire('Error', `No se pudo guardar la asignación: ${error.message}`, 'error'); }
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

    const evidenceModal = document.getElementById('evidenceModal');
    if (evidenceModal) {
        // Evento que se dispara JUSTO ANTES de que el modal se muestre
        evidenceModal.addEventListener('show.bs.modal', function (event) {
            // Obtiene el botón que activó el modal
            const button = event.relatedTarget;
            
            // Extrae la información de los atributos data-*
            const imageUrl = button.getAttribute('data-image-url');
            const zoneName = button.getAttribute('data-zone-name');

            // Selecciona los elementos dentro del modal
            const modalTitle = evidenceModal.querySelector('.modal-title');
            const modalImage = evidenceModal.querySelector('#modalImage');

            // Actualiza el contenido del modal
            modalTitle.textContent = `Evidencia de: ${zoneName}`;
            modalImage.src = imageUrl;
        });

        // Opcional pero recomendado: Limpia la imagen cuando el modal se cierra
        evidenceModal.addEventListener('hide.bs.modal', function () {
            const modalImage = evidenceModal.querySelector('#modalImage');
            modalImage.src = ''; // Evita que se vea la imagen anterior brevemente
        });
    }

// --- LÓGICA PARA EL MODAL "MI PERFIL" ---

// 1. Lógica para ABRIR y RELLENAR el modal
document.body.addEventListener('click', async (event) => {
    if (event.target.id === 'openProfileModalBtn') {
        try {
            const admin = await request('/api/admin/profile');
            document.getElementById('perfilNombre').value = `${admin.names} ${admin.lastnames}`;
            document.getElementById('perfilEmail').value = admin.email;
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar la información del perfil.', 'error');
        }
    }
});

// 2. Lógica para GUARDAR los cambios del perfil
const profileForm = document.getElementById('formMiPerfil');
if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fullName = document.getElementById('perfilNombre').value;
        const email = document.getElementById('perfilEmail').value;

        // Dividimos el nombre completo en nombre y apellido
        const nameParts = fullName.split(' ');
        const names = nameParts.shift(); // El primer elemento
        const lastnames = nameParts.join(' '); // El resto

        try {
            await request('/api/admin/profile', 'PUT', { names, lastnames, email });
            Swal.fire('¡Actualizado!', 'Tu perfil ha sido actualizado.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalMiPerfil')).hide();

            // Actualizamos el nombre en la barra lateral también
            document.getElementById('admin-name-display').textContent = fullName;
        } catch (error) {
            Swal.fire('Error', `No se pudo actualizar el perfil: ${error.message}`, 'error');
        }
    });
}

// --- LÓGICA PARA EL MODAL "CAMBIAR CONTRASEÑA" ---
const changePasswordForm = document.getElementById('formCambiarPassword');
if(changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const currentPassword = document.getElementById('passwordActual').value;
        const newPassword = document.getElementById('passwordNueva').value;
        const confirmPassword = document.getElementById('passwordConfirmar').value;

        // Validación en el frontend
        if (newPassword !== confirmPassword) {
            Swal.fire('Error', 'Las nuevas contraseñas no coinciden.', 'error');
            return;
        }

        try {
            await request('/api/admin/change-password', 'POST', { currentPassword, newPassword });
            
            Swal.fire('¡Éxito!', 'Tu contraseña ha sido cambiada.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalCambiarPassword')).hide();
            changePasswordForm.reset();

        } catch (error) {
            Swal.fire('Error', `No se pudo cambiar la contraseña: ${error.message}`, 'error');
        }
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