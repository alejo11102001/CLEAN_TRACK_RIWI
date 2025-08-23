import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config(); // carga variables de .env
const { Pool } = pkg;

// Pool de conexiones a PostgreSQL
const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

// Ejemplo para probar conexión
(async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Conexión exitosa ✅:', res.rows[0]);
    } catch (err) {
        console.error('Error en la conexión ❌:', err.message);
    }
})();

export default pool;
