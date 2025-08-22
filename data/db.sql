-- ========= CREACIÓN DE TIPOS ENUMERADOS (ENUM) =========
-- Definimos los tipos personalizados para usarlos en las tablas.
CREATE TYPE shift_enum AS ENUM ('Mañana', 'Tarde', 'Noche');
CREATE TYPE assignment_status_enum AS ENUM ('Activo', 'Inactivo');
CREATE TYPE cleaning_type_enum AS ENUM ('Primera vez', 'Repaso');
CREATE TYPE cleaning_status_enum AS ENUM ('Completado', 'Verificado', 'Rechazado');


-- ========= CREACIÓN DE TABLAS PRINCIPALES =========

-- Tabla para todos los usuarios del sistema (información general)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    names VARCHAR(50) NOT NULL,
    lastnames VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Usar TEXT para hashes de contraseña de longitud variable
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para las zonas de limpieza
CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flats INTEGER NOT NULL, -- 'pisos' en el diagrama
    description TEXT,
    photo VARCHAR(255), -- 'foto' en el diagrama
    qr_identifier VARCHAR(50) UNIQUE NOT NULL
);


-- ========= CREACIÓN DE TABLAS DE ROLES =========

-- Tabla para la información específica de empleados
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    users_id INTEGER UNIQUE NOT NULL, -- UNIQUE para asegurar una relación 1 a 1 con users
    employee_code VARCHAR(50) UNIQUE,
    shift shift_enum,

    FOREIGN KEY(users_id) REFERENCES users(id) ON DELETE CASCADE -- Si se borra el usuario, se borra su perfil de empleado
);

-- Tabla para la información específica de administradores
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    users_id INTEGER UNIQUE NOT NULL, -- UNIQUE para asegurar una relación 1 a 1 con users

    FOREIGN KEY(users_id) REFERENCES users(id) ON DELETE CASCADE -- Si se borra el usuario, se borra su perfil de admin
);


-- ========= CREACIÓN DE TABLAS DE RELACIÓN Y TRANSACCIONES =========

-- Tabla para asignar empleados a zonas específicas
CREATE TABLE zone_assignments (
    id SERIAL PRIMARY KEY,
    users_id INTEGER NOT NULL,
    zones_id INTEGER NOT NULL,
    status assignment_status_enum DEFAULT 'Activo',
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    FOREIGN KEY(users_id) REFERENCES users(id) ON DELETE CASCADE, -- Si se borra el usuario, se borran sus asignaciones
    FOREIGN KEY(zones_id) REFERENCES zones(id) ON DELETE CASCADE -- Si se borra la zona, se borran sus asignaciones
);

-- Tabla principal para registrar cada actividad de limpieza
CREATE TABLE cleaning (
    id SERIAL PRIMARY KEY,
    users_id INTEGER, -- Puede ser NULL si el empleado es eliminado
    zones_id INTEGER NOT NULL,
    cleaned_at TIMESTAMPTZ DEFAULT NOW(),
    cleaning_type cleaning_type_enum NOT NULL,
    observations TEXT,
    evidence VARCHAR(255), -- 'evidencias' en el diagrama
    image_hash VARCHAR(64) UNIQUE, -- Para evitar fotos duplicadas
    status cleaning_status_enum DEFAULT 'Completado',

    FOREIGN KEY(users_id) REFERENCES users(id) ON DELETE SET NULL, -- Si se borra el usuario, el registro de limpieza permanece pero sin autor
    FOREIGN KEY(zones_id) REFERENCES zones(id) ON DELETE RESTRICT -- Impide borrar una zona si tiene registros de limpieza asociados
);