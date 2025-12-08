# Sistema de Gestión Veterinaria

Sistema web completo para la gestión de una clínica veterinaria con arquitectura de microservicios.

## 🚀 Características

- **Sistema de Autenticación**
  - Login con roles (admin, veterinario, recepcionista, cliente)
  - Registro público de clientes con validación DNI (API RENIEC)
  - Sesiones persistentes con localStorage
  - Navbar dinámico que muestra el usuario activo

- **Panel de Administración**
  - Gestión de clientes
  - Gestión de mascotas
  - Programación de citas
  - Control de productos e inventario
  - Gestión de trabajadores

- **Sitio Web Público**
  - Página principal con información de servicios
  - Sistema de registro de clientes
  - Formulario de contacto
  - Diseño responsivo

## 📋 Requisitos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd veterinaria_node
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=veterinaria_db
DB_PORT=3306

# API RENIEC (para validación de DNI)
RENIEC_API_URL=https://api.decolecta.com/v1/reniec/dni
RENIEC_API_TOKEN=sk_12101.jssj9MBwA2GFoZdB1KjxEu2os6cVZIwc

# Puerto del gateway
PORT=3000
```

4. **Crear base de datos**
```bash
# Importar estructura de base de datos
mysql -u root -p < database.sql
```

5. **Crear usuarios de prueba**
```bash
node scripts/create-test-users.js
```

## 🎯 Uso

### Iniciar todos los servicios

```bash
node iniciar-todos.js
```

Esto iniciará:
- Gateway (puerto 3000)
- Servicio Auth (puerto 3006)
- Servicio Clientes (puerto 3001)
- Servicio Mascotas (puerto 3002)
- Servicio Citas (puerto 3003)
- Servicio Productos (puerto 3004)
- Servicio Trabajadores (puerto 3005)

### Acceder al sistema

- **Página principal**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Panel admin**: http://localhost:3000/panel

### Usuarios de prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| recepcion | recepcion123 | Recepcionista |
| drvet | vet123 | Veterinario |

## 📁 Estructura del Proyecto

```
veterinaria_node/
├── config/
│   └── database.js          # Configuración de conexión a BD
├── home-html/               # Sitio web público
│   ├── css/
│   ├── js/
│   │   └── auth-navbar.js   # Gestión de sesión en navbar
│   └── index.html
├── services/                # Microservicios
│   ├── auth/               # Autenticación
│   ├── clientes/           # Gestión de clientes y registro
│   ├── mascotas/           # Gestión de mascotas
│   ├── citas/              # Programación de citas
│   ├── productos/          # Control de productos
│   └── trabajadores/       # Gestión de trabajadores
├── scripts/                # Scripts de utilidad
│   ├── create-test-users.js
│   ├── verify-database.js
│   ├── export-db.js
│   └── import-db.js
├── admin.html              # Panel de administración
├── login.html              # Login y registro
├── gateway.js              # API Gateway
├── iniciar-todos.js        # Script para iniciar todos los servicios
└── database.sql            # Estructura de base de datos
```

## 🗄️ Base de Datos

El sistema utiliza las siguientes tablas principales:

- **usuarios**: Credenciales y roles del sistema
- **clientes**: Información de clientes (con FK a usuarios para registro web)
- **mascotas**: Registro de mascotas
- **citas**: Programación de citas veterinarias
- **tratamientos**: Historial de tratamientos
- **productos**: Inventario de productos
- **trabajadores**: Personal de la clínica
- **ventas**: Registro de ventas

### Scripts de utilidad

```bash
# Verificar estructura de BD
node scripts/verify-database.js

# Crear usuarios de prueba
node scripts/create-test-users.js

# Exportar base de datos
node scripts/export-db.js

# Importar base de datos
node scripts/import-db.js
```

## 🔐 Sistema de Autenticación

### Roles y permisos

- **admin**: Acceso completo al panel de administración
- **veterinario**: Gestión de citas, mascotas y tratamientos
- **recepcionista**: Gestión de clientes, citas y ventas
- **cliente**: Acceso a perfil y citas propias (web)

### Flujo de registro público

1. Usuario ingresa DNI en formulario de registro
2. Sistema consulta API RENIEC para validar y obtener datos
3. Nombres y apellidos se autocompeltan
4. Usuario completa teléfono, email, dirección y contraseña
5. Sistema crea registro en tabla `usuarios` (con rol 'cliente')
6. Sistema crea registro en tabla `clientes` (vinculado con FK)
7. Usuario puede iniciar sesión con su DNI como username

## 🎨 Paleta de Colores

- Primary: `#023b48` (azul oscuro)
- Accent: `#0dc3ff` (cyan)
- Light: `#21d7ff` (azul claro)

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL
- **Autenticación**: bcryptjs
- **Frontend**: Bootstrap 4, jQuery, Font Awesome
- **API Externa**: RENIEC (Decolecta)

## 📝 Notas de Desarrollo

- Los clientes registrados via web tienen `usuario_id` (pueden iniciar sesión)
- Los clientes registrados por admin/recepcionista NO tienen `usuario_id` (registro interno)
- Las contraseñas se hashean con bcryptjs (10 rounds)
- Las sesiones se almacenan en localStorage del navegador
- El navbar se actualiza dinámicamente según el estado de sesión

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

Desarrollado para el curso de Ciclo 8 - Sistema de Gestión Veterinaria
