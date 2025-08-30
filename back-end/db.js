import pg from 'pg';
import 'dotenv/config';

let pool;

// Comprueba si estamos en el entorno de producción (en Render)
if (process.env.NODE_ENV === 'production') {
    // Si estamos en Render, usa la DATABASE_URL que configuraste
    pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Requerido para conexiones a Neon/Heroku
        }
    });
    console.log('Conectado a la base de datos de producción (Neon).');
} else {
    // Si estamos en tu computadora local, usa las variables del .env
    pool = new pg.Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
    console.log('Conectado a la base de datos local.');
}

export default pool;