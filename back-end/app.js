import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // --> MEJORA: Faltaba importar jsonwebtoken
import cors from 'cors';
import pool from './db.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'tu_clave_secreta_super_segura_aqui';

// --> MEJORA: Definición del middleware de autenticación que faltaba
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- ENDPOINTS ---

// POST EMPLOYEE, ADMIN
app.post('/api/admin/create-user', authenticateToken, async (req, res) => { // --> MEJORA: Endpoint protegido
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });

    const {
        names, lastnames, employee_code, email, shift, zone_ids, role,
        temporal_password // --> CORRECCIÓN: El nombre correcto de la variable
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const hashedPassword = await bcrypt.hash(temporal_password, 10);
        const userInsertQuery = `INSERT INTO users (names, lastnames, email, password) VALUES ($1, $2, $3, $4) RETURNING id;`;
        const userResult = await client.query(userInsertQuery, [names, lastnames, email, hashedPassword]);
        const newUserId = userResult.rows[0].id;

        if (role === 'Empleado') {
            const employeeInsertQuery = 'INSERT INTO employees (users_id, employee_code, shift) VALUES ($1, $2, $3);';
            await client.query(employeeInsertQuery, [newUserId, employee_code, shift]);
            if (zone_ids && zone_ids.length > 0) {
                for (const zoneId of zone_ids) {
                    const assignmentQuery = 'INSERT INTO zone_assignments (users_id, zones_id) VALUES ($1, $2);';
                    await client.query(assignmentQuery, [newUserId, zoneId]);
                }
            }
        } else if (role === 'Admin') {
            const adminInsertQuery = 'INSERT INTO admins (users_id) VALUES ($1);';
            await client.query(adminInsertQuery, [newUserId]);
        } else {
            throw new Error('Rol no válido.');
        }

        await client.query('COMMIT');
        res.status(201).json({ message: `Usuario '${email}' creado exitosamente como ${role}.`, userId: newUserId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear usuario:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: `Error: ${error.detail}` });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        client.release();
    }
});

// POST ZONES
app.post('/api/zones', authenticateToken, async (req, res) => { // --> MEJORA: Endpoint protegido
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });

    const { name, flats, description, photo_url, qr_identifier } = req.body;
    if (!name || !flats || !qr_identifier) {
        return res.status(400).json({ message: 'Los campos nombre, piso y qr_identifier son obligatorios.' });
    }
    try {
        const insertQuery = `INSERT INTO zones (name, flats, description, photo, qr_identifier) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
        const newZone = await pool.query(insertQuery, [name, flats, description, photo_url, qr_identifier]);
        res.status(201).json({ message: 'Zona creada exitosamente.', zone: newZone.rows[0] });
    } catch (error) {
        console.error('Error al crear la zona:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El Identificador para QR ya existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST ASSIGNMENTS
app.post('/api/assignments', authenticateToken, async (req, res) => { // --> MEJORA: Endpoint protegido y nombre de la ruta más claro
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });

    const { users_id, zones_id } = req.body; // --> MEJORA: Nombres consistentes
    if (!users_id || !zones_id) {
        return res.status(400).json({ message: 'Los campos users_id y zones_id son obligatorios.' });
    }
    try {
        const insertQuery = `INSERT INTO zone_assignments (users_id, zones_id) VALUES ($1, $2) RETURNING *;`;
        const newAssignment = await pool.query(insertQuery, [users_id, zones_id]);
        res.status(201).json({ message: 'Asignación creada exitosamente.', assignment: newAssignment.rows[0] });
    } catch (error) {
        console.error('Error al crear la asignación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST REGISTER-CLEANING
app.post('/api/cleaning-records', authenticateToken, upload.single('evidence'), async (req, res) => {
    if (req.user.role !== 'Empleado') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }
    const { zoneId, cleaningType, observations, image_hash } = req.body;
    const evidenceFile = req.file;
    const userId = req.user.userId;

    if (!zoneId || !cleaningType || !evidenceFile) {
        return res.status(400).json({ message: 'Faltan datos obligatorios (zona, tipo o evidencia).' });
    }
    const evidence_url = `https://storage.example.com/${evidenceFile.filename}`;
    try {
        const query = `INSERT INTO cleaning (users_id, zones_id, cleaning_type, observations, evidence, image_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
        const result = await pool.query(query, [userId, zoneId, cleaningType, observations, evidence_url, image_hash]);
        res.status(201).json({ message: 'Registro de limpieza creado exitosamente.', recordId: result.rows[0].id });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar el registro.' });
    }
});

// POST /api/login

app.post('/api/login', async (req, res) => {
    // 1. Obtener email y contraseña del cuerpo de la solicitud
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    try {
        // 2. Buscar al usuario en la tabla 'users' por su email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // Si no se encuentra ningún usuario, las credenciales son incorrectas
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const user = userResult.rows[0];

        // 3. Comparar de forma segura la contraseña enviada con el hash guardado
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }
        
        // 4. Determinar el rol del usuario (Admin o Empleado)
        let role = 'Sin Asignar';
        const adminResult = await pool.query('SELECT * FROM admins WHERE users_id = $1', [user.id]);
        if(adminResult.rows.length > 0) {
            role = 'Admin';
        } else {
            const employeeResult = await pool.query('SELECT * FROM employees WHERE users_id = $1', [user.id]);
            if(employeeResult.rows.length > 0) {
                role = 'Empleado';
            }
        }

        // 5. Crear el Token (JWT) con el ID del usuario y su rol
        const tokenPayload = { userId: user.id, role: role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' }); // El token expira en 8 horas

        // 6. Enviar la respuesta exitosa con el token y datos básicos del usuario
        res.json({ 
            message: 'Login exitoso', 
            token, 
            user: { id: user.id, names: user.names, role } 
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET

// GET /api/users - Obtiene todos los usuarios con su rol
app.get('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    try {
        const query = `
            SELECT 
                u.id, u.names, u.lastnames, u.email, u.is_active,
                CASE 
                    WHEN a.users_id IS NOT NULL THEN 'Admin'
                    WHEN e.users_id IS NOT NULL THEN 'Empleado'
                    ELSE 'Sin Asignar' 
                END AS rol
            FROM users u
            LEFT JOIN employees e ON u.id = e.users_id
            LEFT JOIN admins a ON u.id = a.users_id
            ORDER BY u.id;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/employees - Obtiene solo los empleados
app.get('/api/employees', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    try {
        const query = `
            SELECT 
                u.id, u.names, u.lastnames, u.email, e.employee_code, e.shift
            FROM users u
            INNER JOIN employees e ON u.id = e.users_id
            ORDER BY u.names;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/admins - Obtiene solo los administradores
app.get('/api/admins', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    try {
        const query = `
            SELECT 
                u.id, u.names, u.lastnames, u.email
            FROM users u
            INNER JOIN admins a ON u.id = a.users_id
            ORDER BY u.names;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// GET /api/zones - Obtiene todas las zonas
app.get('/api/zones', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    try {
        const result = await pool.query('SELECT * FROM zones ORDER BY flats, name;');
        res.json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// GET /api/assignments - Obtiene todas las asignaciones
app.get('/api/assignments', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    try {
        const query = `
            SELECT 
                za.id, za.status, za.assigned_at,
                u.names || ' ' || u.lastnames AS employee_name,
                z.name AS zone_name
            FROM zone_assignments za
            INNER JOIN users u ON za.users_id = u.id
            INNER JOIN zones z ON za.zones_id = z.id
            ORDER BY u.names, z.name;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// GET /api/cleaning-records - Obtiene todos los registros de limpieza
app.get('/api/cleaning-records', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    try {
        const query = `
            SELECT 
                c.id, c.cleaned_at, c.cleaning_type, c.observations, c.status,
                u.names || ' ' || u.lastnames AS employee_name,
                z.name AS zone_name,
                c.evidence
            FROM cleaning c
            INNER JOIN users u ON c.users_id = u.id
            INNER JOIN zones z ON c.zones_id = z.id
            ORDER BY c.cleaned_at DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/users/:id - Obtiene un usuario específico por su ID
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                u.id, u.names, u.lastnames, u.email,
                CASE 
                    WHEN a.users_id IS NOT NULL THEN 'Admin'
                    WHEN e.users_id IS NOT NULL THEN 'Empleado'
                    ELSE 'Sin Asignar' 
                END AS rol,
                e.employee_code, e.shift
            FROM users u
            LEFT JOIN employees e ON u.id = e.users_id
            LEFT JOIN admins a ON u.id = a.users_id
            WHERE u.id = $1;
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/admin/users/:id - Actualizar un usuario
app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    const { id } = req.params;
    const { names, lastnames, email, role, shift, employee_code } = req.body;
    try {
        await pool.query('BEGIN');
        await pool.query('UPDATE users SET names = $1, lastnames = $2, email = $3 WHERE id = $4', [names, lastnames, email, id]);
        
        // Lógica para actualizar el rol
        if (role === 'Empleado') {
            await pool.query('INSERT INTO employees (users_id, employee_code, shift) VALUES ($1, $2, $3) ON CONFLICT (users_id) DO UPDATE SET employee_code = $2, shift = $3;', [id, employee_code, shift]);
            await pool.query('DELETE FROM admins WHERE users_id = $1', [id]);
        } else if (role === 'Admin') {
            await pool.query('INSERT INTO admins (users_id) VALUES ($1) ON CONFLICT (users_id) DO NOTHING', [id]);
            await pool.query('DELETE FROM employees WHERE users_id = $1', [id]);
        }
        await pool.query('COMMIT');
        res.json({ message: 'Usuario actualizado con éxito.' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar.' });
    }
});

// DELETE /api/admin/users/:id - Eliminar un usuario
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Usuario eliminado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar.' });
    }
});

// GET /api/zones/:id - Obtiene una zona específica por su ID
app.get('/api/zones/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM zones WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Zona no encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la zona:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/zones/:id - Actualizar una zona
app.put('/api/zones/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    
    const { id } = req.params;
    const { name, flats, description, qr_identifier } = req.body;

    if (!name || !flats || !qr_identifier) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    try {
        const query = `
            UPDATE zones 
            SET name = $1, flats = $2, description = $3, qr_identifier = $4 
            WHERE id = $5 
            RETURNING *;
        `;
        const result = await pool.query(query, [name, flats, description, qr_identifier, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Zona no encontrada.' });
        }
        res.json({ message: 'Zona actualizada con éxito.', zone: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar la zona:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El Identificador para QR ya existe en otra zona.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE /api/zones/:id - Eliminar una zona
app.delete('/api/zones/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM zones WHERE id = $1 RETURNING *;', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Zona no encontrada.' });
        }
        res.json({ message: `Zona '${result.rows[0].name}' eliminada con éxito.` });
    } catch (error) {
        console.error('Error al eliminar la zona:', error);
        if (error.code === '23503') {
            return res.status(409).json({ message: 'No se puede eliminar la zona porque tiene registros de limpieza asociados.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/assignments/:id - Obtiene una asignación específica
app.get('/api/assignments/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM zone_assignments WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/assignments/:id - Actualiza una asignación
app.put('/api/assignments/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    const { id } = req.params;
    const { users_id, zones_id } = req.body;
    if (!users_id || !zones_id) {
        return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }
    try {
        const query = 'UPDATE zone_assignments SET users_id = $1, zones_id = $2 WHERE id = $3 RETURNING *;';
        const result = await pool.query(query, [users_id, zones_id, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada.' });
        }
        res.json({ message: 'Asignación actualizada con éxito.', assignment: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la asignación.' });
    }
});

// DELETE /api/assignments/:id - Elimina una asignación
app.delete('/api/assignments/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Acceso denegado.' });
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM zone_assignments WHERE id = $1 RETURNING *;', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada.' });
        }
        res.json({ message: 'Asignación eliminada con éxito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la asignación.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});