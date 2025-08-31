# Clean Track RIWI - Sistema de Gestión de Limpieza

Clean Track RIWI es una aplicación web completa diseñada para la gestión y monitoreo eficiente de tareas de limpieza en instalaciones. La plataforma cuenta con dos roles principales: Administradores, que gestionan zonas, usuarios y asignaciones; y Empleados, que registran sus actividades de limpieza a través de un sistema de validación por QR.

El sistema proporciona un monitor en tiempo real del estado de las zonas, un sistema de reportes de productividad y un historial completo de todas las actividades, garantizando un control total sobre la operación.



# ✨ Características Principales

 ## Para Administradores:

Dashboard Interactivo: Visualización de estadísticas clave en tiempo real (limpiezas del día, zonas pendientes, colaboradores activos).

Gestión de Zonas (CRUD): Crear, editar y eliminar zonas de limpieza, asignando un identificador QR único y una foto de referencia.

Gestión de Usuarios (CRUD): Crear, editar y eliminar usuarios con roles de "Admin" o "Empleado", y gestionar su estado (Activo/Inactivo).

Gestión de Asignaciones: Asignar manualmente zonas a empleados o usar una función de asignación aleatoria para distribuir las tareas equitativamente.

Monitor de Zonas en Tiempo Real: Un mapa interactivo que muestra el estado de cada zona (Verde: Limpio, Rojo: Pendiente) con un límite de tiempo configurable (6 horas).

Generador de Reportes: Sistema de filtrado por fechas y tipo de reporte para analizar la productividad por empleado o el historial general.

Generador de Códigos QR: Genera y permite imprimir los códigos QR únicos para cada zona.

## Para Empleados:

Dashboard Personalizado: Visualización de las zonas asignadas para el día, con su estado actual.

Registro de Limpieza Seguro: Sistema de validación mediante escaneo de QR para confirmar que el empleado está en la zona correcta.

Subida de Evidencias: Permite tomar una foto como prueba del trabajo realizado, la cual se almacena de forma segura en la nube.

Perfil de Usuario: Visualización de su información personal y de trabajo.

## 🛠️ Tecnologías Utilizadas

Frontend:

HTML5

CSS3

JavaScript (ES6+ Modules)

Bootstrap 5 para el diseño responsivo.

SweetAlert2 para notificaciones y alertas.

Chart.js para la visualización de datos en el dashboard.

QRCode.js para la generación de códigos QR.

Backend:

Node.js con Express.js para la API REST.

PostgreSQL como base de datos relacional.

JWT (JSON Web Tokens) para la autenticación y seguridad de rutas.

bcrypt para el hasheo seguro de contraseñas.

Multer y Multer-S3 para la gestión de subida de archivos.

Nodemailer para el envío de correos (recuperación de contraseña).

Base de Datos y Almacenamiento:

PostgreSQL para el almacenamiento de datos.

AWS S3 (Amazon Web Services) para el almacenamiento de imágenes de evidencia y zonas.

### 📂 Estructura del Proyecto
Aquí tienes una visión general de la estructura de carpetas y archivos para entender cómo se organiza el proyecto.
```
├── back-end/
│   ├── node_modules/                 # Dependencias del backend (Node.js)
│   ├── uploads/                      # Directorio para subir las fotos de evidencia
│   ├── .env                          # Variables de entorno para la configuración
│   ├── app.js                        # Lógica principal del servidor Express
│   ├── db.js                         # Configuración y conexión a PostgreSQL
│   ├── package-lock.json             # Bloqueo de las versiones de dependencias
│   └── package.json                  # Lista de dependencias del backend
├── data/
│   └── db.sql                        # Archivo SQL con el esquema de la base de datos
├── front-end/
│   ├── css/                          # Hojas de estilo CSS
│   │   ├── dashboard_admin.css
│   │   ├── styles.css
│   │   └── zonas_employee.css
│   ├── img/                          # Imágenes y activos del frontend
│   ├── js/                           # Archivos JavaScript
│   │   ├── api.js                    # Lógica para las llamadas a la API
│   │   ├── auth-controller.js        # Lógica para la autenticación
│   │   ├── main.js                   # Lógica del dashboard del administrador
│   │   ├── reset-password.js         # Lógica para restablecer la contraseña
│   │   ├── service-worker.js         # Service Worker para la funcionalidad offline
│   │   └── zones_employee.js         # Lógica del portal del empleado
│   ├── change_password.html          # Página para cambiar la contraseña
│   ├── dashboard_admin.html          # Panel principal del administrador
│   ├── index.html                    # Página de inicio (login)
│   └── zones_employee.html           # Panel del empleado
├── .gitignore                        # Archivo para ignorar directorios y archivos de Git
├── README.md                         # Descripción del proyecto
├── manifest.json                     # Manifiesto de la aplicación web (PWA)
└── package.json                      # Lista de dependencias del proyecto (root)
```
## 🚀 Guía de Instalación y Puesta en Marcha

Sigue estos pasos para clonar, configurar y ejecutar el proyecto en tu entorno local.



# 1. Prerrequisitos

Asegúrate de tener instalado el siguiente software en tu máquina:



Node.js (versión 18.x o superior)

npm (generalmente se instala con Node.js)

Un cliente de PostgreSQL como DBeaver o pgAdmin.

Git para clonar el repositorio.

Una cuenta de AWS para crear un bucket S3.

Una cuenta de Gmail con la "Verificación en 2 pasos" activada para generar una contraseña de aplicación.

# 2. Descarga del Proyecto

Clona el repositorio desde GitHub a tu máquina local:



git clone [https://github.com/alejo11102001/CLEAN_TRACK_RIWI]

cd tu-repositorio

# 3. Configuración del Backend

Navega a la carpeta del backend:



cd back-end

Instala todas las dependencias del proyecto:



npm install

Crea un archivo .env en la raíz de la carpeta back-end y copia el contenido de .env.example (si existe) o añade las siguientes variables. Este archivo es crucial para guardar tus claves secretas.



# Configuración de la Base de Datos PostgreSQL

DB_USER=postgres

DB_HOST=localhost

DB_DATABASE=clean_track_riwi

DB_PASSWORD=tu_contraseña_de_postgres

DB_PORT=5432



# Clave Secreta para JSON Web Tokens (JWT)

# Genera una clave aleatoria larga (ej: desde [https://randomkeygen.com/](https://randomkeygen.com/))

JWT_SECRET=tu_clave_secreta_larga_y_aleatoria_aqui



# Credenciales de AWS S3 para almacenamiento de imágenes

AWS_ACCESS_KEY_ID=tu_aws_access_key_id

AWS_SECRET_ACCESS_KEY=tu_aws_secret_access_key

AWS_S3_BUCKET_NAME=el_nombre_unico_de_tu_bucket_s3

AWS_REGION=la_region_de_tu_bucket # ej: us-east-1



# Credenciales de Gmail para enviar correos (usa una Contraseña de Aplicación)

EMAIL_USER=tu_correo@gmail.com

EMAIL_PASS=tu_contraseña_de_aplicacion_de_16_caracteres

# 4. Configuración de la Base de Datos

Abre tu cliente de PostgreSQL (DBeaver/pgAdmin).

Crea una nueva base de datos con el nombre que especificaste en tu archivo .env (ej: cleantrack_db).

Ejecuta el script SQL db.sql (que puedes generar desde DBeaver con "Generar DDL") para crear todas las tablas, tipos y relaciones necesarias.

# 5. Iniciar la Aplicación

Debes iniciar tanto el servidor del backend como el del frontend.



Iniciar el Backend:

Abre una terminal en la carpeta back-end y ejecuta:



node app.js

Si todo está bien, verás el mensaje: Servidor corriendo en http://localhost:3000.

Iniciar el Frontend:

Abre la carpeta front-end en Visual Studio Code.

Asegúrate de tener la extensión "Live Server" instalada.

Haz clic derecho en tu archivo index.html (o el de login) y selecciona "Open with Live Server".

Esto abrirá tu aplicación en el navegador, generalmente en http://127.0.0.1:5500.

# ☁️ Despliegue

La aplicación está diseñada para ser desplegada en servicios modernos con capas gratuitas.



Base de Datos (PostgreSQL): Se recomienda Neon.

Backend (Node.js API): Se recomienda Render. No olvides configurar todas las variables de entorno en el panel de Render.

Frontend (Sitio Estático): Se recomienda Netlify o Vercel.

Pasos post-despliegue:



Actualiza la variable API_BASE_URL en tu archivo front-end/js/api.js para que apunte a la URL de tu backend en Render.

Actualiza la variable resetLink en tu app.js para que apunte a la URL de tu frontend en Netlify.

Actualiza la política de CORS de tu bucket S3 para permitir peticiones desde tu nueva URL de Netlify.

# ✒️ Autores

Abrahan Taborda.

Jeronimo Rodriguez.

Emmanuel Jaramillo.

Luis Ducuara.

Diego Zuluaga.

## coders Van-rossum

# ¡Gracias por revisar este proyecto!
