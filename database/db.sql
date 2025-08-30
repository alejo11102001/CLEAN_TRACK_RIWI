-- ========= CREACIÓN DE TIPOS ENUMERADOS (ENUM) =========
CREATE TYPE public.assignment_status_enum AS ENUM (
	'Completada',
	'Pendiente');
CREATE TYPE public.cleaning_status_enum AS ENUM (
	'Completado',
	'Verificado',
	'Rechazado',
	'Pendiente');
CREATE TYPE public.cleaning_type_enum AS ENUM (
	'Primera vez',
	'Repaso');
CREATE TYPE public.shift_enum AS ENUM (
	'Mañana',
	'Tarde',
	'Noche');

-- ========= CREACIÓN DE TABLAS =========

CREATE TABLE public.users (
	id SERIAL PRIMARY KEY,
	names VARCHAR(50) NOT NULL,
	lastnames VARCHAR(50) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	"password" TEXT NOT NULL,
	is_active BOOLEAN DEFAULT true NULL,
	created_at TIMESTAMPTZ DEFAULT now() NULL,
	password_reset_token TEXT NULL,
	password_reset_expires TIMESTAMPTZ NULL
);

CREATE TABLE public.admins (
	id SERIAL PRIMARY KEY,
	users_id INT UNIQUE NOT NULL,
	CONSTRAINT admins_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.employees (
	id SERIAL PRIMARY KEY,
	users_id INT UNIQUE NOT NULL,
	employee_code VARCHAR(50) UNIQUE NULL,
	shift public.shift_enum NULL,
	CONSTRAINT employees_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.zones (
	id SERIAL PRIMARY KEY,
	"name" VARCHAR(100) NOT NULL,
	flats INT NOT NULL,
	description TEXT NULL,
	photo VARCHAR(255) NULL,
	qr_identifier VARCHAR(50) UNIQUE NOT NULL,
	last_cleaned_at TIMESTAMPTZ NULL,
	last_cleaned_by INT NULL,
	last_cleaning_type public.cleaning_type_enum NULL,
	CONSTRAINT fk_last_cleaned_by FOREIGN KEY (last_cleaned_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.cleaning (
	id SERIAL PRIMARY KEY,
	users_id INT NULL,
	zones_id INT NOT NULL,
	cleaned_at TIMESTAMPTZ DEFAULT now() NULL,
	cleaning_type public.cleaning_type_enum NOT NULL,
	observations TEXT NULL,
	evidence VARCHAR(255) NULL,
	image_hash VARCHAR(64) UNIQUE NULL,
	status public.cleaning_status_enum DEFAULT 'Pendiente'::cleaning_status_enum NULL,
	CONSTRAINT cleaning_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT cleaning_zones_id_fkey FOREIGN KEY (zones_id) REFERENCES public.zones(id) ON DELETE RESTRICT
);

CREATE TABLE public.zone_assignments (
	id SERIAL PRIMARY KEY,
	users_id INT NOT NULL,
	zones_id INT NOT NULL,
	status public.assignment_status_enum DEFAULT 'Pendiente'::assignment_status_enum NULL,
	assigned_at TIMESTAMPTZ DEFAULT now() NULL,
	CONSTRAINT zone_assignments_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE,
	CONSTRAINT zone_assignments_zones_id_fkey FOREIGN KEY (zones_id) REFERENCES public.zones(id) ON DELETE CASCADE
);