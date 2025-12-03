# ENDPOINTS

Base URL: http://localhost:3000/api

## CLIENTES

GET /clientes - Listar todos los clientes
GET /clientes/:id - Obtener cliente por ID
GET /clientes/dni/:dni - Buscar cliente por DNI
POST /clientes - Registrar nuevo cliente
POST /clientes/validar-dni - Validar DNI con RENIEC
PUT /clientes/:id - Actualizar cliente
DELETE /clientes/:id - Eliminar cliente (soft delete)

## MASCOTAS

GET /mascotas - Listar todas las mascotas
GET /mascotas/:id - Obtener mascota por ID
GET /mascotas/cliente/:clienteId - Listar mascotas de un cliente
GET /mascotas/stats/general - Obtener estadisticas de mascotas
POST /mascotas - Registrar nueva mascota
PUT /mascotas/:id - Actualizar mascota
DELETE /mascotas/:id - Eliminar mascota (soft delete)

## CITAS

GET /citas - Listar todas las citas
GET /citas/:id - Obtener cita por ID
GET /citas/fecha/hoy - Listar citas del dia actual
GET /citas/mascota/:mascotaId - Listar citas de una mascota
POST /citas - Crear nueva cita
PUT /citas/:id - Actualizar cita
PUT /citas/:id/estado - Cambiar estado de cita
DELETE /citas/:id - Eliminar cita

## PRODUCTOS

GET /productos - Listar todos los productos
GET /productos/:id - Obtener producto por ID
GET /productos/stock/bajo - Listar productos con stock bajo
GET /productos/stats/general - Obtener estadisticas de productos
POST /productos - Registrar nuevo producto
PUT /productos/:id - Actualizar producto
PUT /productos/:id/stock - Actualizar stock del producto
DELETE /productos/:id - Eliminar producto

## TRABAJADORES

GET /trabajadores - Listar todos los trabajadores
GET /trabajadores/:id - Obtener trabajador por ID
GET /trabajadores/veterinarios/activos - Listar veterinarios activos
POST /trabajadores - Registrar nuevo trabajador
PUT /trabajadores/:id - Actualizar trabajador
DELETE /trabajadores/:id - Eliminar trabajador

## TRATAMIENTOS

GET /tratamientos - Listar todos los tratamientos
GET /tratamientos/:id - Obtener tratamiento por ID
GET /tratamientos/mascota/:mascotaId - Listar tratamientos de una mascota
POST /tratamientos - Registrar nuevo tratamiento
PUT /tratamientos/:id - Actualizar tratamiento
DELETE /tratamientos/:id - Eliminar tratamiento

## AUTENTICACION

POST /auth/login - Iniciar sesion
POST /auth/register - Crear nuevo usuario
GET /auth/users - Obtener lista de usuarios
PUT /auth/change-password - Cambiar contrasena

## SALUD

GET /health - Verificar estado del sistema
