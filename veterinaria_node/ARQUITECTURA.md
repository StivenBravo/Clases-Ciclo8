# 🏗️ Arquitectura del Sistema de Gestión Veterinaria

## 📐 Patrón de Arquitectura: Microservicios

El sistema está diseñado con una arquitectura de microservicios que proporciona:
- **Escalabilidad**: Cada servicio puede escalar independientemente
- **Mantenibilidad**: Cambios aislados sin afectar otros servicios
- **Resiliencia**: Si un servicio falla, los demás continúan funcionando
- **Desarrollo paralelo**: Equipos pueden trabajar en diferentes servicios simultáneamente

## 🔧 Componentes del Sistema

### 1. API Gateway (Puerto 3000)
**Responsabilidad**: Punto de entrada único para todas las peticiones

```
Cliente → Gateway → Microservicio específico
```

**Funcionalidades**:
- Enrutamiento de peticiones
- Proxy hacia microservicios
- Servir archivos estáticos (frontend)
- Health check de todos los servicios
- Manejo centralizado de errores

**Tecnologías**: Express, Axios, CORS

---

### 2. Microservicio de Clientes (Puerto 3001)
**Responsabilidad**: Gestión de propietarios de mascotas

**Endpoints principales**:
```
GET    /api/clientes              # Listar todos
POST   /api/clientes              # Crear cliente
POST   /api/clientes/validar-dni  # Validar con RENIEC
GET    /api/clientes/dni/:dni     # Buscar por DNI
PUT    /api/clientes/:id          # Actualizar
DELETE /api/clientes/:id          # Eliminar (soft)
```

**Características especiales**:
- Integración con API RENIEC para validación de DNI
- Validación de DNI único
- Soft delete para preservar historial

**Tabla de BD**: `clientes`

---

### 3. Microservicio de Mascotas (Puerto 3002)
**Responsabilidad**: Gestión de mascotas registradas

**Endpoints principales**:
```
GET  /api/mascotas                    # Listar todas
GET  /api/mascotas/cliente/:id       # Por cliente
POST /api/mascotas                    # Crear mascota
PUT  /api/mascotas/:id                # Actualizar
GET  /api/mascotas/stats/general     # Estadísticas
```

**Características especiales**:
- Relación con clientes (validación de cliente activo)
- Estados: activo, inactivo, fallecido
- Especies: perro, gato, ave, roedor, reptil, otro
- Estadísticas por especie

**Tabla de BD**: `mascotas`

---

### 4. Microservicio de Citas (Puerto 3003)
**Responsabilidad**: Programación y gestión de citas veterinarias

**Endpoints principales**:
```
GET  /api/citas                  # Listar todas
GET  /api/citas/fecha/hoy        # Citas del día
POST /api/citas                  # Crear cita
PUT  /api/citas/:id/estado       # Cambiar estado
```

**Características especiales**:
- Validación de disponibilidad de veterinarios
- No permite doble reserva de veterinario
- Tipos: consulta, vacunación, cirugía, control, emergencia
- Estados: pendiente, confirmada, en_proceso, completada, cancelada
- Filtros por fecha y estado

**Tabla de BD**: `citas`

---

### 5. Microservicio de Productos (Puerto 3004)
**Responsabilidad**: Inventario de productos para mascotas

**Endpoints principales**:
```
GET  /api/productos                # Listar todos
GET  /api/productos/stock/bajo     # Stock bajo
PUT  /api/productos/:id/stock      # Actualizar stock
GET  /api/productos/stats/general  # Estadísticas
```

**Características especiales**:
- Control de stock con alertas de stock mínimo
- Categorías: alimento, medicamento, accesorio, higiene, juguete
- Estados: disponible, agotado, descontinuado
- Actualización automática de estado según stock
- Precios de compra y venta

**Tabla de BD**: `productos`

---

### 6. Microservicio de Trabajadores y Tratamientos (Puerto 3005)
**Responsabilidad**: Gestión de personal y tratamientos médicos

**Endpoints de Trabajadores**:
```
GET  /api/trabajadores                      # Listar todos
GET  /api/trabajadores/veterinarios/activos # Veterinarios
POST /api/trabajadores                      # Crear trabajador
```

**Endpoints de Tratamientos**:
```
GET  /api/tratamientos                # Listar todos
GET  /api/tratamientos/mascota/:id   # Por mascota
POST /api/tratamientos                # Crear tratamiento
PUT  /api/tratamientos/:id            # Actualizar
```

**Características especiales**:
- Cargos: veterinario, asistente, recepcionista, administrador
- Especialidades para veterinarios
- Historial médico completo de mascotas
- Estados de tratamiento: en_curso, completado, suspendido
- Relación con citas médicas

**Tablas de BD**: `trabajadores`, `tratamientos`

---

## 🗄️ Capa de Datos - MySQL

### Diseño de Base de Datos

#### Relaciones principales:
```
clientes (1) ──→ (N) mascotas
mascotas (1) ──→ (N) citas
mascotas (1) ──→ (N) tratamientos
trabajadores (1) ──→ (N) citas
trabajadores (1) ──→ (N) tratamientos
citas (1) ──→ (1) tratamientos
productos (1) ──→ (N) detalle_ventas
clientes (1) ──→ (N) ventas
```

#### Características de BD:
- **Integridad referencial**: Foreign keys con ON DELETE CASCADE
- **Soft deletes**: Campo `estado` en lugar de eliminar registros
- **Timestamps**: Registro automático de fechas
- **Índices**: En campos de búsqueda frecuente (DNI, fechas, estados)

---

## 🌐 Comunicación entre Servicios

### Patrón de Comunicación: HTTP/REST

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│     API Gateway         │
│   (Puerto 3000)         │
└───┬────┬────┬────┬─────┘
    │    │    │    │
    ▼    ▼    ▼    ▼
   S1   S2   S3   S4   S5
```

Donde:
- S1 = Servicio Clientes (3001)
- S2 = Servicio Mascotas (3002)
- S3 = Servicio Citas (3003)
- S4 = Servicio Productos (3004)
- S5 = Servicio Trabajadores (3005)

### Ventajas del Gateway:
1. **Punto único de entrada**: Simplifica la configuración de CORS
2. **Routing centralizado**: Fácil agregar/modificar rutas
3. **Monitoreo**: Health checks de todos los servicios
4. **Seguridad**: Posibilidad de agregar autenticación centralizada

---

## 🎨 Capa de Presentación (Frontend)

### Tecnologías:
- HTML5 semántico
- CSS3 con variables y gradientes
- JavaScript Vanilla (sin frameworks)

### Patrón de diseño:
- **SPA (Single Page Application)**: Navegación sin recarga
- **Fetch API**: Comunicación con backend
- **Event-driven**: Listeners para interactividad

### Componentes UI:
1. **Sidebar**: Navegación lateral colapsable
2. **Dashboard**: Cards de estadísticas
3. **Tablas dinámicas**: Renderizado desde JSON
4. **Modales**: Para formularios (pendiente implementar)
5. **Notificaciones**: Sistema de alertas toast

---

## 🔄 Flujo de Datos Típico

### Ejemplo: Crear una Cita

```
1. Usuario completa formulario en frontend
   ↓
2. JavaScript envía POST a Gateway
   POST http://localhost:3000/api/citas
   ↓
3. Gateway hace proxy a Servicio de Citas
   POST http://localhost:3003/api/citas
   ↓
4. Servicio de Citas valida:
   - ¿Mascota existe y está activa?
   - ¿Veterinario existe y es veterinario?
   - ¿Veterinario disponible en ese horario?
   ↓
5. Si todo OK, inserta en MySQL
   ↓
6. Respuesta JSON viaja de regreso:
   Servicio → Gateway → Frontend
   ↓
7. Frontend actualiza UI y muestra notificación
```

---

## 🔐 Seguridad (Implementada y Futura)

### Implementado:
- ✅ Validación de datos en backend
- ✅ Soft deletes para preservar datos
- ✅ Validación de relaciones (FK)
- ✅ Prevención de duplicados (DNI único)
- ✅ Validación de disponibilidad (citas)

### Futuro:
- 🔜 Autenticación JWT
- 🔜 Roles y permisos
- 🔜 Rate limiting
- 🔜 Encriptación de datos sensibles
- 🔜 HTTPS en producción
- 🔜 Logs de auditoría

---

## 📊 Escalabilidad

### Estrategias de Escalado:

#### Horizontal (Recomendado):
```
Load Balancer
    ↓
┌────┴────┐
│Gateway 1│  │Gateway 2│  │Gateway 3│
└─────────┘  └─────────┘  └─────────┘
      ↓           ↓            ↓
   [Microservicios replicados]
```

#### Vertical:
- Aumentar recursos del servidor
- Optimizar queries de BD
- Implementar caché (Redis)

---

## 🧪 Testing (Futuro)

### Niveles de Testing:
1. **Unit Tests**: Jest para lógica de negocio
2. **Integration Tests**: Supertest para endpoints
3. **E2E Tests**: Cypress para flujos completos
4. **Load Tests**: Artillery para performance

---

## 📦 Despliegue

### Opciones de Deployment:

#### Desarrollo:
```bash
npm run start:all  # Todos los servicios localmente
```

#### Producción (Recomendaciones):

**Opción A - Docker**:
```
docker-compose.yml
├── gateway (container)
├── service-clientes (container)
├── service-mascotas (container)
├── service-citas (container)
├── service-productos (container)
├── service-trabajadores (container)
└── mysql (container)
```

**Opción B - Cloud (AWS)**:
- EC2 para cada servicio
- RDS para MySQL
- ELB para load balancing
- S3 para archivos estáticos

**Opción C - Serverless**:
- AWS Lambda + API Gateway
- Aurora Serverless para BD

---

## 🔧 Mantenimiento

### Logs:
Cada servicio registra:
- Inicio del servicio
- Errores de BD
- Requests fallidos

### Monitoreo:
- Health check endpoint en cada servicio
- Dashboard de estado en Gateway

### Backups:
- BD: mysqldump automático
- Código: Git repository

---

## 📈 Métricas Clave

### Performance:
- Tiempo de respuesta < 200ms
- Throughput: 100+ req/s por servicio
- Uptime: 99.9% SLA

### Negocio:
- Total de clientes activos
- Citas por día
- Productos con bajo stock
- Ingresos por ventas

---

## 🚀 Roadmap Técnico

### Fase 2 (Próxima):
- [ ] MongoDB para logs y auditoría
- [ ] Sistema de caché con Redis
- [ ] WebSockets para notificaciones real-time
- [ ] API de reportes con generación de PDF

### Fase 3:
- [ ] App móvil (React Native)
- [ ] Sistema de mensajería (RabbitMQ)
- [ ] Machine Learning para predicciones
- [ ] Integración con pagos online

---

Este documento describe la arquitectura actual del sistema. Para detalles de implementación específicos, consultar el código fuente y los comentarios inline.
