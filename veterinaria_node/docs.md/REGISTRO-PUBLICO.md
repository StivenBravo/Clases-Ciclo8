# Sistema de Registro Público de Clientes

## Cambios implementados:

### 1. Frontend (login.html)
- ✅ Agregado sistema de pestañas (Login / Registrarse)
- ✅ Formulario de registro con campos:
  - DNI (autocompleta con RENIEC)
  - Nombres, Apellido Paterno, Apellido Materno (readonly, se llenan automáticamente)
  - Teléfono (obligatorio)
  - Correo electrónico (obligatorio)
- ✅ Consulta automática a API RENIEC al ingresar DNI
- ✅ Mensajes de éxito y error
- ✅ Validación de campos

### 2. Backend - Servicio de Clientes (services/clientes/server.js)
- ✅ Nuevo endpoint: GET `/api/clientes/reniec/:dni` - Consulta RENIEC por DNI
- ✅ Nuevo endpoint: POST `/api/clientes/register` - Registro público sin autenticación
- ✅ Nuevo endpoint: PUT `/api/clientes/:id/aprobar` - Aprobar registros pendientes
- ✅ Modificado endpoint: GET `/api/clientes` - Ahora acepta parámetro ?estado=todos|activo|pendiente

### 3. Panel de Administración (js/main.js)
- ✅ Tabla de clientes ahora muestra columna "Estado"
- ✅ Badges visuales para estados (activo, pendiente, inactivo)
- ✅ Botón "Aprobar" para registros pendientes
- ✅ Función `aprobarCliente(id)` para cambiar estado

### 4. Base de Datos
- ✅ Script SQL creado: `update-clientes-table.sql`
- Debe ejecutarse para agregar columna `estado` a la tabla `clientes`

## Flujo de registro:

1. Usuario visita `/login` y hace clic en pestaña "Registrarse"
2. Ingresa su DNI (8 dígitos)
3. Sistema consulta automáticamente RENIEC y llena nombres y apellidos
4. Usuario completa teléfono y correo
5. Al enviar, se crea registro con estado "pendiente"
6. Administrador ve el registro en el panel con badge "pendiente"
7. Administrador hace clic en botón "Aprobar" ✓
8. Cliente cambia a estado "activo" y puede usar el sistema

## Pasos para completar:

1. Ejecutar el script SQL:
```bash
mysql -u root -p veterinaria_db < update-clientes-table.sql
```

O ejecutar manualmente:
```sql
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';

UPDATE clientes 
SET estado = 'activo' 
WHERE estado IS NULL OR estado = '';
```

2. Reiniciar servicios:
```bash
npm start
```

3. Probar el flujo:
- Ir a http://localhost:3000/login
- Cambiar a pestaña "Registrarse"
- Ingresar DNI válido
- Completar formulario
- Verificar en panel admin que aparece como "pendiente"
- Aprobar el registro

## Notas:
- Los registros públicos se crean con estado "pendiente"
- Los registros creados desde el panel admin se crean con estado "activo"
- La API RENIEC debe estar configurada en .env
- Se mantiene la validación de DNI duplicado
