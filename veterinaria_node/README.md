# 🏥 Sistema de Gestión Veterinaria

Sistema de gestión integral para veterinarias con arquitectura de microservicios usando Node.js, Express y MySQL.

## 📋 Características

### Módulos Implementados

1. **Gestión de Clientes** (Puerto 3001)
   - Registro de clientes con validación DNI - API RENIEC
   - CRUD completo de clientes
   - Búsqueda por DNI

2. **Gestión de Mascotas** (Puerto 3002)
   - Registro de mascotas asociadas a clientes
   - Historial de mascotas
   - Estados: activo, inactivo, fallecido

3. **Gestión de Citas** (Puerto 3003)
   - Programación de citas
   - Tipos: consulta, vacunación, cirugía, control, emergencia
   - Estados: pendiente, confirmada, en proceso, completada, cancelada
   - Validación de disponibilidad de veterinarios

4. **Gestión de Productos** (Puerto 3004)
   - Inventario de productos para mascotas
   - Categorías: alimento, medicamento, accesorio, higiene, juguete
   - Control de stock y alertas
   - Precios de compra y venta

5. **Gestión de Trabajadores y Tratamientos** (Puerto 3005)
   - Personal: veterinarios, asistentes, recepcionistas, administradores
   - Registro de tratamientos médicos
   - Historial clínico de mascotas

## 🏗️ Arquitectura

```
veterinaria_node/
├── config/
│   └── database.js          # Configuración MySQL
├── services/
│   ├── clientes/
│   │   └── server.js        # Microservicio de Clientes
│   ├── mascotas/
│   │   └── server.js        # Microservicio de Mascotas
│   ├── citas/
│   │   └── server.js        # Microservicio de Citas
│   ├── productos/
│   │   └── server.js        # Microservicio de Productos
│   └── trabajadores/
│       └── server.js        # Microservicio de Trabajadores
├── css/
│   └── style.css            # Estilos del frontend
├── js/
│   └── main.js              # Lógica del frontend
├── gateway.js               # API Gateway (Puerto 3000)
├── iniciar-todos.js         # Script para iniciar todos los servicios
├── database.sql             # Esquema de base de datos MySQL
├── .env                     # Variables de entorno
├── package.json
└── index.html               # Interfaz web

```

## 🚀 Instalación

### 1. Requisitos Previos

- Node.js v14 o superior
- MySQL 5.7 o superior
- npm o yarn

### 2. Clonar e Instalar Dependencias

```bash
cd veterinaria_node
npm install
```

### 3. Configurar Base de Datos

**Opción A: Desde línea de comandos MySQL**
```bash
mysql -u root -p < database.sql
```

**Opción B: Desde MySQL Workbench o phpMyAdmin**
1. Abrir MySQL Workbench
2. Crear nueva conexión o usar existente
3. Abrir el archivo `database.sql`
4. Ejecutar el script completo

### 4. Configurar Variables de Entorno

Editar el archivo `.env` con tus credenciales:

```env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=veterinaria_db
DB_PORT=3306

# Puertos de Microservicios
PORT_GATEWAY=3000
PORT_CLIENTES=3001
PORT_MASCOTAS=3002
PORT_CITAS=3003
PORT_PRODUCTOS=3004
PORT_TRABAJADORES=3005

# API RENIEC (Opcional)
RENIEC_API_TOKEN=tu_token_aqui
RENIEC_API_URL=https://api.apis.net.pe/v1/dni
```

### 5. Iniciar el Sistema

**Opción A: Iniciar todos los servicios a la vez**
```bash
npm run start:all
```

**Opción B: Iniciar servicios individualmente**

Terminal 1 - Gateway:
```bash
npm start
```

Terminal 2 - Servicio de Clientes:
```bash
npm run service:clientes
```

Terminal 3 - Servicio de Mascotas:
```bash
npm run service:mascotas
```

Terminal 4 - Servicio de Citas:
```bash
npm run service:citas
```

Terminal 5 - Servicio de Productos:
```bash
npm run service:productos
```

Terminal 6 - Servicio de Trabajadores:
```bash
npm run service:trabajadores
```

## 🌐 Acceso al Sistema

### Frontend
```
http://localhost:3000
```

### API Gateway
```
http://localhost:3000/api
```

### Microservicios Individuales
- Clientes: http://localhost:3001/api
- Mascotas: http://localhost:3002/api
- Citas: http://localhost:3003/api
- Productos: http://localhost:3004/api
- Trabajadores: http://localhost:3005/api

### Health Check
```
http://localhost:3000/api/health
```

## 📡 Endpoints de la API

### Clientes
```
GET    /api/clientes                    # Listar todos
GET    /api/clientes/:id                # Obtener por ID
GET    /api/clientes/dni/:dni           # Buscar por DNI
POST   /api/clientes/validar-dni        # Validar DNI con RENIEC
POST   /api/clientes                    # Crear cliente
PUT    /api/clientes/:id                # Actualizar cliente
DELETE /api/clientes/:id                # Eliminar (soft delete)
```

### Mascotas
```
GET    /api/mascotas                    # Listar todas
GET    /api/mascotas/:id                # Obtener por ID
GET    /api/mascotas/cliente/:id       # Mascotas de un cliente
GET    /api/mascotas/stats/general     # Estadísticas
POST   /api/mascotas                    # Crear mascota
PUT    /api/mascotas/:id                # Actualizar mascota
DELETE /api/mascotas/:id                # Eliminar (soft delete)
```

### Citas
```
GET    /api/citas                       # Listar todas
GET    /api/citas/:id                   # Obtener por ID
GET    /api/citas/mascota/:id          # Citas de una mascota
GET    /api/citas/fecha/hoy            # Citas del día
POST   /api/citas                       # Crear cita
PUT    /api/citas/:id                   # Actualizar cita
PUT    /api/citas/:id/estado           # Cambiar estado
DELETE /api/citas/:id                   # Cancelar cita
```

### Productos
```
GET    /api/productos                   # Listar todos
GET    /api/productos/:id               # Obtener por ID
GET    /api/productos/codigo/:codigo   # Buscar por código
GET    /api/productos/stock/bajo       # Productos con stock bajo
GET    /api/productos/stats/general    # Estadísticas
POST   /api/productos                   # Crear producto
PUT    /api/productos/:id               # Actualizar producto
PUT    /api/productos/:id/stock        # Actualizar stock
DELETE /api/productos/:id               # Descontinuar producto
```

### Trabajadores
```
GET    /api/trabajadores                # Listar todos
GET    /api/trabajadores/:id            # Obtener por ID
GET    /api/trabajadores/veterinarios/activos  # Listar veterinarios
POST   /api/trabajadores                # Crear trabajador
PUT    /api/trabajadores/:id            # Actualizar trabajador
DELETE /api/trabajadores/:id            # Eliminar (soft delete)
```

### Tratamientos
```
GET    /api/tratamientos                # Listar todos
GET    /api/tratamientos/:id            # Obtener por ID
GET    /api/tratamientos/mascota/:id   # Tratamientos de una mascota
POST   /api/tratamientos                # Crear tratamiento
PUT    /api/tratamientos/:id            # Actualizar tratamiento
DELETE /api/tratamientos/:id            # Eliminar tratamiento
```

## 🗃️ Base de Datos

### Tablas Principales
- `clientes` - Información de propietarios
- `mascotas` - Registro de mascotas
- `trabajadores` - Personal de la veterinaria
- `citas` - Programación de citas
- `tratamientos` - Historial médico
- `productos` - Inventario de productos
- `ventas` - Registro de ventas
- `detalle_ventas` - Detalle de cada venta

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MySQL2** - Cliente MySQL con soporte para Promises
- **Axios** - Cliente HTTP para comunicación entre servicios
- **CORS** - Manejo de CORS
- **dotenv** - Gestión de variables de entorno

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos (diseño moderno y responsive)
- **JavaScript Vanilla** - Lógica del cliente
- **Font Awesome** - Iconos

## 🎨 Diseño UI/UX

Interfaz basada en el diseño de Figma proporcionado:
- Dashboard con estadísticas en tiempo real
- Navegación lateral con menú colapsable
- Tablas responsivas con acciones
- Modales para formularios
- Sistema de notificaciones
- Diseño moderno con gradientes y sombras

## 📝 Datos de Ejemplo

El sistema incluye datos de ejemplo:
- 4 trabajadores (2 veterinarios, 1 asistente, 1 recepcionista)
- 5 productos de diferentes categorías

## 🔐 Seguridad

- Validación de datos en el backend
- Soft delete para preservar historial
- Validación de DNI con API RENIEC (opcional)
- Validación de disponibilidad de veterinarios

## 🚧 Próximas Implementaciones

- [ ] MongoDB como segundo gestor de BD
- [ ] Autenticación y autorización de usuarios
- [ ] Sistema de ventas completo
- [ ] Reportes en PDF
- [ ] Notificaciones por email/SMS
- [ ] Dashboard con gráficos estadísticos
- [ ] Calendario interactivo de citas
- [ ] Historial médico detallado

## 🐛 Solución de Problemas

### Error al conectar con MySQL
```bash
# Verificar que MySQL esté corriendo
# Windows: Services > MySQL
# Linux: sudo systemctl status mysql

# Verificar credenciales en .env
DB_USER=root
DB_PASSWORD=tu_contraseña
```

### Puerto ya en uso
```bash
# Cambiar puerto en .env
PORT_GATEWAY=3000  # Cambiar a otro puerto disponible
```

### Servicios no inician
```bash
# Verificar que todas las dependencias estén instaladas
npm install

# Verificar que la base de datos esté creada
mysql -u root -p -e "SHOW DATABASES LIKE 'veterinaria_db';"
```

## 👥 Autor

Proyecto desarrollado para la gestión integral de veterinarias

## 📄 Licencia

ISC
