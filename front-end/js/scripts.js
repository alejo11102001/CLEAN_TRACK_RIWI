document.addEventListener('DOMContentLoaded', function() {

    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

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
            <div class="row g-4"><div class="col-lg-7"><div class="card shadow-sm"><div class="card-header fw-bold">Actividad de la Semana</div><div class="card-body"><canvas id="activityChart" height="150"></canvas></div></div></div><div class="col-lg-5"><div class="card shadow-sm"><div class="card-header fw-bold">Registros Recientes</div><ul id="lista-registros-recientes" class="list-group list-group-flush"><li class="list-group-item text-muted">No hay actividad reciente.</li></ul></div></div></div>
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
                            <tbody id="cleaningRecordsTableBody">
                                <tr>
                                    <td colspan="6" class="text-center text-muted">No hay registros para mostrar.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `,
        // ========== VISTA ZONAS ==========
        zones: `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h2 fw-bold">Gestión de Zonas</h1>
                <!-- BOTÓN MODIFICADO PARA ABRIR EL MODAL -->
                <button type="button" class="btn btn-riwi-primary d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#modalNuevaZona">
                    <i class="bi bi-plus-lg me-2"></i> Nueva Zona
                </button>
            </div>
            <div id="zonas-grid-container" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"><div class="col"><p class="text-center text-muted">No hay zonas definidas.</p></div></div>
        `,
        // ========== VISTA USUARIOS ==========
        users: `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h2 fw-bold">Gestión de Usuarios</h1>
                <!-- BOTÓN MODIFICADO PARA ABRIR EL MODAL -->
                <button type="button" class="btn btn-riwi-primary d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                    <i class="bi bi-plus-lg me-2"></i> Nuevo Usuario
                </button>
            </div>
            <div class="card shadow-sm"><div class="card-body"><div class="table-responsive"><table class="table table-hover align-middle"><thead class="table-light"><tr><th scope="col">Nombre Completo</th><th scope="col">Email</th><th scope="col">Rol</th><th scope="col" class="text-end">Acciones</th></tr></thead><tbody id="tabla-usuarios-body"><tr><td colspan="4" class="text-center text-muted">No hay usuarios registrados.</td></tr></tbody></table></div></div></div>
        `,
           // ========== NUEVA VISTA ASIGNACIONES ==========
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
                            <tbody id="tabla-asignaciones-body">
                                <tr>
                                    <td colspan="3" class="text-center text-muted">No hay asignaciones creadas.</td>
                                </tr>
                                </tbody>
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

    // Función para cargar la vista en el contenido principal
    function loadView(viewName) {
        mainContent.innerHTML = views[viewName] || '<h2>Contenido no encontrado</h2>';
    }

    // Manejar los clics en los enlaces de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Evita que el enlace recargue la página
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const view = this.getAttribute('data-view');
            loadView(view);
        });
    });

    // Cargar la vista inicial (Dashboard) por defecto
    loadView('dashboard');
});