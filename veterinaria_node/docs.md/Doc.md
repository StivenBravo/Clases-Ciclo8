# Arquitectura del Sistema de Gestión Veterinaria

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

### 4. Microservicio de Citas (Puerto 3003)
**Responsabilidad**: Programación y gestión de citas veterinarias
**Endpoints principales**:
```
GET  /api/citas                  # Listar todas
GET  /api/citas/fecha/hoy        # Citas del día
POST /api/citas                  # Crear cita
PUT  /api/citas/:id/estado       # Cambiar estado
```

### 5. Microservicio de Productos (Puerto 3004)
**Responsabilidad**: Inventario de productos para mascotas
**Endpoints principales**:
```
GET  /api/productos                # Listar todos
GET  /api/productos/stock/bajo     # Stock bajo
PUT  /api/productos/:id/stock      # Actualizar stock
GET  /api/productos/stats/general  # Estadísticas
```
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
