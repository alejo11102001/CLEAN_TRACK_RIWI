import { request } from '../../front-end/js/api.js';

// Función para cargar los registros de limpieza
const loadCleaningRecords = async () => {
    const tableBody = document.getElementById('cleaningRecordsTableBody');
    tableBody.innerHTML = ''; // Limpia el contenido actual (incluyendo el "No hay registros")

    try {
        const records = await request('/api/cleaning-records', 'GET');

        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay registros para mostrar.</td></tr>';
            return;
        }

        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.zone_name}</td>
                <td>${record.employee_name}</td>
                <td><span class="badge bg-primary">${record.cleaning_type}</span></td>
                <td>${new Date(record.cleaned_at).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.open('${record.evidence}', '_blank')">
                        <i class="bi bi-image"></i> Ver Evidencia
                    </button>
                </td>
                <td>${record.observations || '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar los registros.</td></tr>';
        console.error('Error al cargar los registros:', error);
    }
};

// Llama a la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Asegúrate de que el token exista antes de cargar los datos
    if (!localStorage.getItem('authToken')) {
        window.location.href = '/login.html';
        return;
    }
    
    // Aquí puedes llamar a todas las funciones que necesites cargar, como
    // loadUsers(), loadZones(), etc.
    loadCleaningRecords();
});