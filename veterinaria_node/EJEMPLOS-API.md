# 📡 Ejemplos de Uso de la API

Ejemplos prácticos de cómo usar la API del sistema de gestión veterinaria.

## 🔗 Base URL
```
http://localhost:3000/api
```

---

## 👥 Clientes

### Validar DNI con RENIEC
```bash
curl -X POST http://localhost:3000/api/clientes/validar-dni \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "12345678"
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "dni": "12345678",
    "nombres": "JUAN CARLOS",
    "apellido_paterno": "PEREZ",
    "apellido_materno": "GOMEZ"
  }
}
```

### Registrar Cliente
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "12345678",
    "nombres": "Juan Carlos",
    "apellido_paterno": "Perez",
    "apellido_materno": "Gomez",
    "telefono": "987654321",
    "email": "juan.perez@email.com",
    "direccion": "Av. Los Pinos 123, Lima"
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Cliente registrado exitosamente",
  "data": {
    "id": 1,
    "dni": "12345678"
  }
}
```

### Listar Todos los Clientes
```bash
curl http://localhost:3000/api/clientes
```

### Buscar Cliente por DNI
```bash
curl http://localhost:3000/api/clientes/dni/12345678
```

### Actualizar Cliente
```bash
curl -X PUT http://localhost:3000/api/clientes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan Carlos",
    "apellido_paterno": "Perez",
    "apellido_materno": "Gomez",
    "telefono": "999888777",
    "email": "nuevo.email@email.com",
    "direccion": "Nueva direccion 456"
  }'
```

---

## 🐕 Mascotas

### Registrar Mascota
```bash
curl -X POST http://localhost:3000/api/mascotas \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "nombre": "Max",
    "especie": "perro",
    "raza": "Labrador",
    "fecha_nacimiento": "2020-05-15",
    "sexo": "macho",
    "color": "Dorado",
    "peso": 25.5,
    "observaciones": "Muy juguetón y amigable"
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Mascota registrada exitosamente",
  "data": {
    "id": 1,
    "nombre": "Max"
  }
}
```

### Listar Mascotas de un Cliente
```bash
curl http://localhost:3000/api/mascotas/cliente/1
```

### Obtener Estadísticas de Mascotas
```bash
curl http://localhost:3000/api/mascotas/stats/general
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "total": 15,
    "por_especie": [
      {"especie": "perro", "cantidad": 8},
      {"especie": "gato", "cantidad": 5},
      {"especie": "ave", "cantidad": 2}
    ]
  }
}
```

---

## 📅 Citas

### Crear Cita
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -d '{
    "mascota_id": 1,
    "veterinario_id": 1,
    "fecha_cita": "2024-12-10 10:00:00",
    "motivo": "Vacunación anual",
    "tipo": "vacunacion",
    "observaciones": "Primera vacuna del año",
    "costo": 80.00
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Cita registrada exitosamente",
  "data": {
    "id": 1
  }
}
```

### Ver Citas del Día
```bash
curl http://localhost:3000/api/citas/fecha/hoy
```

### Filtrar Citas por Fecha
```bash
curl "http://localhost:3000/api/citas?fecha=2024-12-10"
```

### Cambiar Estado de Cita
```bash
curl -X PUT http://localhost:3000/api/citas/1/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "confirmada"
  }'
```

**Estados disponibles**:
- `pendiente`
- `confirmada`
- `en_proceso`
- `completada`
- `cancelada`

### Cancelar Cita
```bash
curl -X DELETE http://localhost:3000/api/citas/1
```

---

## 📦 Productos

### Registrar Producto
```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PROD001",
    "nombre": "Alimento Premium Adulto",
    "descripcion": "Alimento balanceado para perros adultos 15kg",
    "categoria": "alimento",
    "marca": "Ricocan",
    "precio_compra": 80.00,
    "precio_venta": 120.00,
    "stock": 50,
    "stock_minimo": 10
  }'
```

### Listar Productos con Stock Bajo
```bash
curl http://localhost:3000/api/productos/stock/bajo
```

### Actualizar Stock
```bash
# Entrada de stock
curl -X PUT http://localhost:3000/api/productos/1/stock \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 20,
    "tipo": "entrada"
  }'

# Salida de stock
curl -X PUT http://localhost:3000/api/productos/1/stock \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 5,
    "tipo": "salida"
  }'
```

### Filtrar Productos por Categoría
```bash
curl "http://localhost:3000/api/productos?categoria=medicamento"
```

### Obtener Estadísticas de Productos
```bash
curl http://localhost:3000/api/productos/stats/general
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "resumen": {
      "total_productos": 25,
      "total_stock": 450,
      "valor_total": 15250.00
    },
    "por_categoria": [
      {
        "categoria": "alimento",
        "cantidad": 10,
        "valor_inventario": 8000.00
      }
    ]
  }
}
```

---

## 👨‍⚕️ Trabajadores

### Registrar Trabajador
```bash
curl -X POST http://localhost:3000/api/trabajadores \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "87654321",
    "nombres": "María Elena",
    "apellidos": "Gonzales Rojas",
    "cargo": "veterinario",
    "especialidad": "Cirugía",
    "telefono": "987654321",
    "email": "maria.gonzales@vet.com",
    "fecha_contratacion": "2024-01-15",
    "salario": 4000.00
  }'
```

### Listar Veterinarios Activos
```bash
curl http://localhost:3000/api/trabajadores/veterinarios/activos
```

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombres": "Carlos",
      "apellidos": "Mendoza Ruiz",
      "especialidad": "Medicina General"
    }
  ],
  "count": 1
}
```

### Filtrar por Cargo
```bash
curl "http://localhost:3000/api/trabajadores?cargo=veterinario"
```

---

## 💊 Tratamientos

### Registrar Tratamiento
```bash
curl -X POST http://localhost:3000/api/tratamientos \
  -H "Content-Type: application/json" \
  -d '{
    "cita_id": 1,
    "mascota_id": 1,
    "veterinario_id": 1,
    "diagnostico": "Infección respiratoria leve",
    "tratamiento": "Antibióticos durante 7 días",
    "medicamentos": "Amoxicilina 250mg cada 12 horas",
    "indicaciones": "Administrar con alimento, mantener en reposo",
    "fecha_inicio": "2024-12-03",
    "fecha_fin": "2024-12-10",
    "costo": 150.00
  }'
```

### Ver Tratamientos de una Mascota
```bash
curl http://localhost:3000/api/tratamientos/mascota/1
```

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "diagnostico": "Infección respiratoria leve",
      "tratamiento": "Antibióticos durante 7 días",
      "fecha_inicio": "2024-12-03",
      "estado": "en_curso",
      "vet_nombres": "Carlos",
      "vet_apellidos": "Mendoza Ruiz"
    }
  ],
  "count": 1
}
```

### Actualizar Tratamiento
```bash
curl -X PUT http://localhost:3000/api/tratamientos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "diagnostico": "Infección respiratoria leve - Mejoría notable",
    "tratamiento": "Continuar antibióticos 3 días más",
    "medicamentos": "Amoxicilina 250mg cada 12 horas",
    "indicaciones": "Mantener tratamiento, control en 3 días",
    "fecha_fin": "2024-12-13",
    "costo": 180.00,
    "estado": "en_curso"
  }'
```

---

## 🏥 Health Check

### Verificar Estado del Sistema
```bash
curl http://localhost:3000/api/health
```

**Respuesta**:
```json
{
  "status": "OK",
  "timestamp": "2024-12-03T10:30:00.000Z",
  "database": "Connected",
  "services": {
    "clientes": "UP",
    "mascotas": "UP",
    "citas": "UP",
    "productos": "UP",
    "trabajadores": "UP"
  }
}
```

---

## 🔧 Ejemplos con JavaScript/Fetch

### Registrar Cliente desde Frontend
```javascript
async function registrarCliente(datos) {
  try {
    const response = await fetch('http://localhost:3000/api/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Cliente registrado:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Error de conexión:', error);
  }
}

// Uso
registrarCliente({
  dni: '12345678',
  nombres: 'Juan',
  apellido_paterno: 'Perez',
  apellido_materno: 'Gomez',
  telefono: '987654321',
  email: 'juan@email.com',
  direccion: 'Av. Principal 123'
});
```

### Listar Citas del Día
```javascript
async function obtenerCitasHoy() {
  try {
    const response = await fetch('http://localhost:3000/api/citas/fecha/hoy');
    const result = await response.json();
    
    if (result.success) {
      console.log(`Hay ${result.count} citas hoy`);
      return result.data;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🧪 Ejemplos con Postman

### Colección de Postman

Puedes importar esta colección a Postman:

```json
{
  "info": {
    "name": "Veterinaria API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Clientes",
      "item": [
        {
          "name": "Listar Clientes",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/clientes"
          }
        },
        {
          "name": "Crear Cliente",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/clientes",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"dni\": \"12345678\",\n  \"nombres\": \"Juan\",\n  \"apellido_paterno\": \"Perez\",\n  \"apellido_materno\": \"Gomez\",\n  \"telefono\": \"987654321\",\n  \"email\": \"juan@email.com\",\n  \"direccion\": \"Av. Principal 123\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## ⚠️ Manejo de Errores

### Respuestas de Error Comunes

**404 - No Encontrado**:
```json
{
  "success": false,
  "message": "Cliente no encontrado"
}
```

**400 - Datos Inválidos**:
```json
{
  "success": false,
  "message": "Faltan campos requeridos"
}
```

**500 - Error del Servidor**:
```json
{
  "success": false,
  "message": "Error al procesar la solicitud"
}
```

---

Para más información sobre la API, consultar la documentación completa en `README.md` y `ARQUITECTURA.md`.
