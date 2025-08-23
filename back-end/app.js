import express from 'express';
import bcrypt from 'bcrypt';
import pool from './db.js';

const app = express();
app.use(express.json());


// POST EMPLOYEE, ADMIN
app.post('/api/admin/create-user', async (req, res) => {
    // 1. Recibir todos los datos del formulario desde el frontend
    const {
        names,
        lastnames,
        employee_code,
        email,
        shift,
        zone_ids, // Se espera un array de IDs de zona, ej: [1, 3, 5]
        role,
        temporal_password
    } = req.body;

    // Conexión con la base de datos
    const client = await pool.connect();

    try {
        // 2. INICIAR TRANSACCIÓN
        await client.query('BEGIN');

        // 3. Hashear la contraseña temporal
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(temporal_password, saltRounds);

        // 4. Insertar en la tabla 'users' y obtener el ID del nuevo usuario
        const userInsertQuery = `
            INSERT INTO users (names, lastnames, email, password) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id;
        `;
        const userResult = await client.query(userInsertQuery, [names, lastnames, email, hashedPassword]);
        const newUserId = userResult.rows[0].id;

        // 5. Basado en el ROL, insertar en la tabla correspondiente
        if (role === 'Empleado') {
            // Insertar en la tabla 'employees'
            const employeeInsertQuery = 'INSERT INTO employees (users_id, employee_code, shift) VALUES ($1, $2, $3);';
            await client.query(employeeInsertQuery, [newUserId, employee_code, shift]);

            // 6. Insertar las zonas asignadas en 'zone_assignments'
            if (zone_ids && zone_ids.length > 0) {
                for (const zoneId of zone_ids) {
                    const assignmentQuery = 'INSERT INTO zone_assignments (users_id, zones_id) VALUES ($1, $2);';
                    await client.query(assignmentQuery, [newUserId, zoneId]);
                }
            }

        } else if (role === 'Admin') {
            // Insertar en la tabla 'admins'
            const adminInsertQuery = 'INSERT INTO admins (users_id) VALUES ($1);';
            await client.query(adminInsertQuery, [newUserId]);
            // Nota: Los admins usualmente no se asignan a zonas de limpieza.

        } else {
            throw new Error('Rol no válido.');
        }

        // 7. Si todo fue exitoso, CONFIRMAR TRANSACCIÓN
        await client.query('COMMIT');
        
        res.status(201).json({ message: `Usuario '${email}' creado exitosamente como ${role}.`, userId: newUserId });

    } catch (error) {
        // Si algo falla, REVERTIR TRANSACCIÓN
        await client.query('ROLLBACK');
        console.error('Error al crear usuario:', error);
        
        if (error.code === '23505') { // Error de unicidad (email o código de empleado duplicado)
            return res.status(409).json({ message: `Error: ${error.detail}` });
        }
        
        res.status(500).json({ message: 'Error interno del servidor.' });

    } finally {
        // Liberar la conexión
        client.release();
    }
});

// POST ZONES

app.post('/api/zones', async (req, res) => {

    // 2. Obtener los datos del cuerpo de la solicitud
    const { name, flats, description, photo_url, qr_identifier } = req.body;

    // 3. Validar que los campos obligatorios existan
    if (!name || !flats || !qr_identifier) {
        return res.status(400).json({ message: 'Los campos nombre, piso y qr_identifier son obligatorios.' });
    }

    try {
        // 4. Escribir la consulta para insertar la nueva zona
        const insertQuery = `
            INSERT INTO zones (name, flats, description, photo, qr_identifier)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *; -- RETURNING * devuelve la fila completa que se acaba de crear
        `;

        const newZone = await pool.query(insertQuery, [name, flats, description, photo_url, qr_identifier]);

        // 5. Responder con éxito
        res.status(201).json({
            message: 'Zona creada exitosamente.',
            zone: newZone.rows[0]
        });

    } catch (error) {
        console.error('Error al crear la zona:', error);

        // Manejar error de identificador QR duplicado
        if (error.code === '23505' && error.constraint === 'zones_qr_identifier_key') {
            return res.status(409).json({ message: 'El Identificador para QR ya existe.' });
        }

        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
