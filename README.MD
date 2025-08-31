# Clean Track RIWI - Sistema de Gestión de Limpieza

Clean Track RIWI es una aplicación web completa diseñada para la gestión y monitoreo eficiente de tareas de limpieza en instalaciones. La plataforma cuenta con dos roles principales: Administradores, que gestionan zonas, usuarios y asignaciones; y Empleados, que registran sus actividades de limpieza a través de un sistema de validación por QR.

El sistema proporciona un monitor en tiempo real del estado de las zonas, un sistema de reportes de productividad y un historial completo de todas las actividades, garantizando un control total sobre la operación.



## ✨ Características Principales

El sistema está diseñado con dos roles principales, cada uno con un conjunto de herramientas específicas para maximizar la eficiencia y el control.

### Para Administradores:

*   **Dashboard Interactivo:** Visualización de estadísticas clave en tiempo real, incluyendo limpiezas del día, zonas pendientes y colaboradores activos.
*   **Gestión de Zonas (CRUD):** Permite crear, editar y eliminar zonas de limpieza, asignando a cada una un identificador QR único y una foto de referencia para fácil identificación.
*   **Gestión de Usuarios (CRUD):** Administra usuarios con roles de "Admin" o "Empleado". Puedes crear, editar, eliminar y gestionar su estado (Activo/Inactivo).
*   **Gestión de Asignaciones:** Asigna zonas a empleados de forma manual o utiliza una función de **asignación aleatoria** para distribuir las tareas equitativamente.
*   **Monitor de Zonas en Tiempo Real:** Un mapa interactivo que muestra el estado de cada zona (Verde: Limpio, Rojo: Pendiente) con un límite de tiempo configurable (por defecto 6 horas) para el reinicio del estado.
*   **Generador de Reportes:** Un potente sistema de filtrado por fechas y tipo de reporte que permite analizar la productividad por empleado o consultar el historial general de limpieza.
*   **Generador de Códigos QR:** Genera e imprime los códigos QR únicos para cada zona, listos para ser colocados físicamente en el lugar.

### Para Empleados:

*   **Dashboard Personalizado:** Una vista clara y concisa de las zonas asignadas para la jornada laboral, mostrando el estado actual de cada una.
*   **Registro de Limpieza Seguro:** Un sistema de validación mediante escaneo de QR que garantiza que el empleado se encuentre físicamente en la zona correcta antes de registrar una limpieza.
*   **Subida de Evidencias:** Permite capturar y subir una fotografía como prueba irrefutable del trabajo realizado. Las imágenes se almacenan de forma segura en la nube.
*   **Perfil de Usuario:** Acceso a la información personal y de trabajo registrada en el sistema.

## 🛠️ Tecnologías Utilizadas

La aplicación utiliza un conjunto de tecnologías modernas y eficientes, seleccionadas para construir una solución robusta, escalable y segura.

| Capa | Tecnología | Propósito en el Proyecto |
| :--- | :--- | :--- |
| **Frontend** | **HTML5, CSS3 y JavaScript (ES6+)** | Pilares del desarrollo web para la estructura, diseño y lógica interactiva del cliente. |
| | **Bootstrap 5** | Acelera el desarrollo de la interfaz de usuario con un diseño responsivo y mobile-first. |
| | **SweetAlert2** | Proporciona notificaciones y alertas modales atractivas y personalizadas para el usuario. |
| | **Chart.js** | Visualiza métricas clave del sistema mediante gráficos interactivos en el dashboard de administrador. |
| | **QRCode.js** | Permite la generación dinámica de códigos QR para cada zona de limpieza. |
| **Backend** | **Node.js con Express.js** | Entorno de ejecución y framework para construir una API RESTful de alto rendimiento. |
| | **JWT (JSON Web Tokens)** | Gestiona la autenticación segura y sin estado para proteger las rutas de la API. |
| | **bcrypt** | Hashea de forma segura las contraseñas de los usuarios para garantizar que nunca se almacenen en texto plano. |
| | **Multer y Multer-S3** | Se utilizan en conjunto para procesar la subida de archivos y almacenarlos directamente en el servicio de nube de AWS S3. |
| | **Nodemailer** | Se encarga del envío de correos electrónicos transaccionales, como los de recuperación de contraseña. |
| **Base de Datos y<br>Almacenamiento** | **PostgreSQL** | Es el sistema de gestión de base de datos relacional para el almacenamiento estructurado y persistente de toda la información. |
| | **AWS S3** | Servicio de almacenamiento de objetos en la nube, optimizado para guardar las fotos de evidencia y de zonas, manteniendo el servidor ligero y escalable. |

---

## 📂 Estructura del Proyecto
Aquí tienes una visión general de la estructura de carpetas y archivos para entender cómo se organiza el proyecto.
```
├── back-end/
│   ├── node_modules/                 # Dependencias del backend (Node.js)
│   ├── .env                          # Variables de entorno para la configuración
│   ├── app.js                        # Lógica principal del servidor Express
│   ├── db.js                         # Configuración y conexión a PostgreSQL
│   ├── package-lock.json             # Bloqueo de las versiones de dependencias
│   └── package.json                  # Lista de dependencias del backend
├── data/
│   └── db.sql                        # Archivo SQL con el esquema de la base de datos
├── docs/                             # Documentación del proyecto
│   └── MER/                          # Modelo Entidad-Relación
│       └── (Imágenes)                # Imágenes del diagrama MER
├── front-end/
│   ├── css/                          # Hojas de estilo CSS
│   │   ├── dashboard_admin.css
│   │   ├── styles.css
│   │   └── zonas_employee.css
│   ├── html/                         # Páginas HTML del sitio
│   │   ├── change_password.html      # Página para cambiar la contraseña
│   │   ├── dashboard_admin.html      # Panel principal del administrador
│   │   ├── index.html                # Página de inicio (login)
│   │   └── zones_employee.html       # Panel del empleado
│   ├── img/                          # Imágenes y activos del frontend
│   └── js/                           # Archivos JavaScript
│       ├── api.js                    # Lógica para las llamadas a la API
│       ├── auth-controller.js        # Lógica para la autenticación
│       ├── main.js                   # Lógica del dashboard del administrador
│       ├── reset-password.js         # Lógica para restablecer la contraseña
│       ├── service-worker.js         # Service Worker para la funcionalidad offline
│       └── zones_employee.js         # Lógica del portal del empleado
├── .gitignore                        # Archivo para ignorar directorios y archivos de Git
├── README.md                         # Descripción del proyecto
├── manifest.json                     # Manifiesto de la aplicación web (PWA)
└── package.json                      # Lista de dependencias del proyecto (root)
```

## 🚀 Guía de Instalación y Puesta en Marcha

Sigue estos pasos para clonar, configurar y ejecutar el proyecto en tu entorno local.

### 1. Prerrequisitos

Asegúrate de tener instalado el siguiente software en tu máquina:

*   **Node.js** (versión 18.x o superior)
*   **npm** (generalmente se instala con Node.js)
*   Un cliente de **PostgreSQL** como DBeaver o pgAdmin.
*   **Git** para clonar el repositorio.
*   Una cuenta de **AWS** para crear un bucket S3.
*   Una cuenta de **Gmail** con la "Verificación en 2 pasos" activada para generar una contraseña de aplicación.

### 2. Descarga del Proyecto

Clona el repositorio desde GitHub a tu máquina local:

```bash
git clone https://github.com/alejo11102001/CLEAN_TRACK_RIWI
cd CLEAN_TRACK_RIWI
```

### 3. Configuración del Backend

Navega a la carpeta del backend:

```bash
cd back-end
```

Instala todas las dependencias del proyecto:

```bash
npm install
npm i
```

Crea un archivo `.env` en la raíz de la carpeta `back-end` y añade las siguientes variables. Este archivo es crucial para guardar tus claves secretas.

```env
### Configuración de la Base de Datos PostgreSQL
PGHOST=168.119.183.3
PGPORT=5432
PGDATABASE=clean_track_riwi
PGUSER=root
PGPASSWORD=s7cq453mt2jnicTaQXKT

```

### 4. Configuración de la Base de Datos

1.  Abre tu cliente de PostgreSQL (DBeaver/pgAdmin).
2.  Crea una nueva base de datos con el nombre que especificaste en tu archivo `.env` (ej: `clean_track_riwi`).
3.  Ejecuta el script SQL `db.sql` para crear todas las tablas, tipos y relaciones necesarias.

### 5. Iniciar la Aplicación

Debes iniciar tanto el servidor del backend como el del frontend.

### Iniciar el Backend:

Abre una terminal en la carpeta `back-end` y ejecuta:

```bash
node app.js
```

Si todo está bien, verás el mensaje: `Servidor corriendo en http://localhost:3000`.

### Iniciar el Frontend:

1.  Abre la carpeta `front-end` en Visual Studio Code.
2.  Asegúrate de tener la extensión **"Live Server"** instalada.
3.  Haz clic derecho en tu archivo `index.html`y selecciona **"Open with Live Server"**.
4.  Esto abrirá tu aplicación en el navegador, generalmente en `http://127.0.0.1:5500`.

---
## 🧑‍💻 Credenciales de Ejemplo

Puedes usar las siguientes credenciales para iniciar sesión en la aplicación.

### Administrador
*   **Usuario:** `diego.zuluagaye@amigo.edu.co`
*   **Contraseña:** `Diego12345@`

### Empleado
*   **Usuario:** `jerorrpo@gmail.com`
*   **Contraseña:** `jero12345`

---

# ☁️ Despliegue

La aplicación está diseñada para ser desplegada en servicios modernos con capas gratuitas.

*   **Base de Datos (PostgreSQL):** Se recomienda [Neon](https://neon.tech/).
*   **Backend (Node.js API):** Se recomienda [Render](https://render.com/). No olvides configurar todas las variables de entorno en el panel de Render.
*   **Frontend (Sitio Estático):** Se recomienda [Netlify](https://www.netlify.com/) o [Vercel](https://vercel.com/).

## Pasos post-despliegue:

1.  Actualiza la variable `API_BASE_URL` en tu archivo `front-end/js/api.js` para que apunte a la URL de tu backend en Render.
2.  Actualiza la variable `resetLink` en tu `app.js` para que apunte a la URL de tu frontend en Netlify.
3.  Actualiza la política de CORS de tu bucket S3 para permitir peticiones desde tu nueva URL de Netlify.

---
## 🔗 Link Despliegue

Puedes acceder a la versión en producción aquí:
**[https://vocal-peony-3f0286.netlify.app/](https://vocal-peony-3f0286.netlify.app/)**

# ✒️ Autores

*   Abrahan Taborda
*   Jeronimo Rodriguez
*   Emmanuel Jaramillo
*   Luis Ducuara
*   Diego Zuluaga

*coders Van-rossum*

# ¡Gracias por revisar este proyecto!
