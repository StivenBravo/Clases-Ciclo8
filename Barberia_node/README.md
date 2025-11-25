# 💈 BarberShop Pro - Sistema Web con Node.js y MySQL

Sistema web simple para una barbería que implementa **múltiples servicios REST separados** con Node.js y base de datos MySQL (en lugar de archivos JSON).

## 📋 Características

- ✅ **Múltiples servidores separados**: 3 servidores independientes (como en tu ejemplo de nuevo_node)
- ✅ **Datos desde MySQL**: Los datos provienen de una base de datos, NO de archivos JSON
- ✅ **API RESTful**: Endpoints separados para servicios, barberos y citas
- ✅ **Servidor principal**: Interfaz web que consume los 3 servicios
- ✅ **Fácil de explicar**: Código simple y bien comentado para presentar en clase

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js (http nativo para los servicios, Express para la interfaz)
- **Base de Datos**: MySQL
- **Librerías**: mysql2, cors, express

## 🎯 Arquitectura de Servicios

Este proyecto implementa **5 servicios separados** que corren en puertos diferentes:

| Servidor | Puerto | Ruta | Descripción | Métodos |
|----------|--------|------|-------------|---------|
| **server1.js** | 3001 | `/servicios` | Gestiona los servicios de barbería | GET, POST |
| **server2.js** | 3002 | `/citas` | Gestiona las citas de clientes | GET, POST |
| **server3.js** | 3003 | `/barberos` | Lista los barberos disponibles | GET |
| **server4.js** | 3004 | `/productos` | Catálogo de productos para venta | GET, POST, PUT |
| **server5.js** | 3005 | `/horarios` | Horarios disponibles para reservas | GET, POST, PUT |
| **server.js** | 3000 | `/` | Interfaz web principal | - |

### Diferencia con tu ejemplo de nuevo_node:
- ❌ **nuevo_node**: Lee de archivos JSON (server1.json, server2.json, server3.json)
- ✅ **Barberia_node**: Lee de base de datos MySQL (5 tablas: servicios, citas, barberos, productos, horarios)

## 📦 Instalación

### 1. Instalar dependencias de Node.js

```bash
cd Barberia_node
npm install
```

### 2. Configurar la base de datos MySQL

Ejecuta el archivo `database.sql` en tu gestor de MySQL:

```bash
mysql -u root -p < database.sql
```

O importa el archivo desde phpMyAdmin o MySQL Workbench.

### 3. Configurar la conexión a la base de datos

Edita los archivos `server1.js`, `server2.js`, `server3.js`, `server4.js` y `server5.js` y ajusta las credenciales de MySQL:

```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Cambia esto según tu configuración
    database: 'barberia_db'
});
```

### 4. Iniciar los servidores

Tienes 3 opciones:

#### Opción 1: Iniciar todos los servidores a la vez (Recomendado)
```bash
npm run todos
```

#### Opción 2: Iniciar cada servidor por separado (en terminales diferentes)
```bash
# Terminal 1
npm run server1

# Terminal 2
npm run server2

# Terminal 3
npm run server3

# Terminal 4
npm run server4

# Terminal 5
npm run server5

# Terminal 6
npm start
```

#### Opción 3: Solo la interfaz web (debe tener los 3 servicios corriendo)
```bash
npm start
```

La página web estará disponible en: `http://localhost:3000`

## 🔌 API Endpoints (Servicios Separados)

### 📌 Servidor 1 - Servicios (Puerto 3001)
```
GET  http://localhost:3001/servicios
     → Lista todos los servicios de barbería desde MySQL

POST http://localhost:3001/servicios
     → Agrega un nuevo servicio a la BD
     Body: { "nombre": "...", "descripcion": "...", "precio": 0, "duracion": 0 }
```

### 📌 Servidor 2 - Citas (Puerto 3002)
```
GET  http://localhost:3002/citas
     → Lista todas las citas con detalles completos

POST http://localhost:3002/citas
     → Crea una nueva cita en la BD
     Body: { "cliente_nombre": "...", "cliente_telefono": "...", "servicio_id": 0, "barbero_id": 0, "fecha_cita": "..." }
```

### 📌 Servidor 3 - Barberos (Puerto 3003)
```
GET  http://localhost:3003/barberos
     → Lista todos los barberos activos
```

### 📌 Servidor 4 - Productos (Puerto 3004)
```
GET  http://localhost:3004/productos
     → Lista todos los productos disponibles

GET  http://localhost:3004/productos/categoria/:categoria
     → Filtra productos por categoría (Styling, Cuidado Barba, Higiene, etc.)

POST http://localhost:3004/productos
     → Agrega un nuevo producto a la BD
     Body: { "nombre": "...", "categoria": "...", "precio": 0, "stock": 0, "marca": "..." }

PUT  http://localhost:3004/productos/:id/stock
     → Actualiza el stock de un producto
     Body: { "stock": 10 }
```

### 📌 Servidor 5 - Horarios (Puerto 3005)
```
GET  http://localhost:3005/horarios
     → Lista todos los horarios futuros

GET  http://localhost:3005/horarios/disponibles
     → Lista solo horarios disponibles

GET  http://localhost:3005/horarios/barbero/:id
     → Lista horarios de un barbero específico

POST http://localhost:3005/horarios
     → Crea un nuevo horario
     Body: { "barbero_id": 1, "fecha": "2025-11-30", "hora_inicio": "10:00:00", "hora_fin": "11:00:00" }

PUT  http://localhost:3005/horarios/:id/disponibilidad
     → Cambia la disponibilidad de un horario
     Body: { "disponible": false }
```

## 📊 Estructura de la Base de Datos

### Tabla: servicios
- `id` - Identificador único
- `nombre` - Nombre del servicio
- `descripcion` - Descripción del servicio
- `precio` - Precio en soles
- `duracion` - Duración en minutos

### Tabla: barberos
- `id` - Identificador único
- `nombre` - Nombre del barbero
- `especialidad` - Especialidad del barbero
- `activo` - Estado (activo/inactivo)

### Tabla: citas
- `id` - Identificador único
- `cliente_nombre` - Nombre del cliente
- `cliente_telefono` - Teléfono del cliente
- `cliente_email` - Email del cliente
- `servicio_id` - FK a servicios
- `barbero_id` - FK a barberos
- `fecha_cita` - Fecha y hora de la cita
- `estado` - Estado de la cita (pendiente, confirmada, cancelada)
- `comentarios` - Comentarios adicionales

### Tabla: productos
- `id` - Identificador único
- `nombre` - Nombre del producto
- `categoria` - Categoría (Styling, Cuidado Barba, Higiene, etc.)
- `descripcion` - Descripción del producto
- `precio` - Precio en soles
- `stock` - Cantidad disponible
- `marca` - Marca del producto

### Tabla: horarios
- `id` - Identificador único
- `barbero_id` - FK a barberos
- `fecha` - Fecha del horario
- `hora_inicio` - Hora de inicio
- `hora_fin` - Hora de fin
- `disponible` - Si está disponible para reservar

## 🎨 Características del Diseño

- Paleta de colores oscura y dorada (elegante)
- Hero section con llamado a la acción
- Grid responsive para servicios y barberos
- Formulario de reserva con validación
- Mensajes de éxito/error
- Footer informativo

## 🚀 Ventajas para tu presentación

1. **Simple pero completo**: Fácil de explicar en clase
2. **5 servicios independientes**: GET, POST, PUT - demuestra conocimiento de REST
3. **Base de datos real**: No usa JSON, usa MySQL con 5 tablas
4. **Código limpio**: Comentado y organizado
5. **Funcional**: Realmente guarda datos en la BD
6. **Relaciones**: Usa Foreign Keys y JOINs entre tablas

## 📝 Notas

- La base de datos incluye datos de ejemplo
- Asegúrate de tener MySQL corriendo antes de iniciar
- Puedes modificar los estilos en `css/style.css`
- El puerto por defecto es 3000, puedes cambiarlo en `server.js`

## 🎓 Para explicar al profesor

Este proyecto demuestra:
- ✅ Arquitectura cliente-servidor
- ✅ 5 servicios REST independientes (microservicios)
- ✅ Comunicación con API REST
- ✅ CRUD completo en base de datos
- ✅ Separación de responsabilidades (HTML, CSS, JS, Backend)
- ✅ Manejo de peticiones asíncronas (async/await)
- ✅ Validación de datos
- ✅ Respuestas HTTP correctas (200, 201, 404, 500)
- ✅ Relaciones entre tablas (Foreign Keys y JOINs)
- ✅ Múltiples métodos HTTP (GET, POST, PUT)

---

Desarrollado como proyecto educativo - Sistema simple pero funcional
