# 📘 COMPARACIÓN: JSON vs MYSQL

## Tu proyecto anterior (nuevo_node)

### Estructura:
```
nuevo_node/
├── server1.js      → Lee de server1.json (platos)
├── server1.json    → Archivo con datos de platos
├── server2.js      → Lee de server2.json (facturas)
├── server2.json    → Archivo con datos de facturas
├── server3.js      → Lee de server3.json (tragos)
└── server3.json    → Archivo con datos de tragos
```

### Funcionamiento:
```javascript
// server1.js - Lee del archivo JSON
const dbPath = path.join(__dirname, 'server1.json');
fs.readFile(dbPath, (err, data) => {
    res.end(data);
});
```

---

## Tu proyecto nuevo (Barberia_node)

### Estructura:
```
Barberia_node/
├── server1.js      → Lee de MySQL tabla servicios
├── server2.js      → Lee de MySQL tabla citas
├── server3.js      → Lee de MySQL tabla barberos
├── server.js       → Interfaz web
├── database.sql    → Script para crear BD
└── index.html      → Página web
```

### Funcionamiento:
```javascript
// server1.js - Lee de MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'barberia_db'
});

db.query('SELECT * FROM servicios', (err, results) => {
    res.end(JSON.stringify(results));
});
```

---

## 🔍 DIFERENCIAS CLAVE

| Aspecto | nuevo_node (JSON) | Barberia_node (MySQL) |
|---------|-------------------|----------------------|
| **Almacenamiento** | Archivos `.json` | Base de datos MySQL |
| **Lectura** | `fs.readFile()` | `db.query()` |
| **Escritura** | `fs.writeFile()` | `INSERT INTO` |
| **Persistencia** | Archivo en disco | Tabla en BD |
| **Consultas** | Lectura completa | Queries SQL |
| **Relaciones** | No hay | Foreign Keys (JOIN) |
| **Escalabilidad** | Limitada | Alta |
| **Concurrencia** | Problemas | Bien manejada |

---

## 🎯 VENTAJAS DE USAR MYSQL

### 1. **Consultas avanzadas**
```sql
-- En MySQL puedes hacer JOINs complejos
SELECT c.*, s.nombre, b.nombre 
FROM citas c
JOIN servicios s ON c.servicio_id = s.id
JOIN barberos b ON c.barbero_id = b.id
WHERE c.fecha_cita > NOW();
```

En JSON tendrías que:
1. Leer citas.json
2. Leer servicios.json
3. Leer barberos.json
4. Hacer el JOIN manualmente en JavaScript

### 2. **Integridad de datos**
```sql
-- Foreign Keys garantizan integridad
FOREIGN KEY (servicio_id) REFERENCES servicios(id)
```

En JSON no hay forma de garantizar que un `servicio_id` exista realmente.

### 3. **Filtros y ordenamiento**
```sql
SELECT * FROM servicios 
WHERE precio < 30 
ORDER BY precio ASC 
LIMIT 5;
```

En JSON tendrías que filtrar y ordenar en JavaScript después de leer todo.

### 4. **Múltiples usuarios simultáneos**
MySQL maneja transacciones y bloqueos automáticamente.
Con archivos JSON, dos usuarios escribiendo al mismo tiempo causan conflictos.

---

## 📝 PARA EXPLICAR AL PROFESOR

**Pregunta esperada**: "¿Por qué usar MySQL en vez de JSON?"

**Tu respuesta**:

> "Profesor, aunque usar archivos JSON es válido para prototipos, en un sistema real necesitamos:
> 
> 1. **Relaciones entre datos**: Las citas referencian servicios y barberos. MySQL garantiza que no se pueda crear una cita con un servicio inexistente.
> 
> 2. **Consultas eficientes**: Con MySQL puedo obtener solo las citas del día actual con un WHERE, en vez de leer todo el archivo JSON y filtrar en JavaScript.
> 
> 3. **Escalabilidad**: Si el negocio crece a 1000 citas, MySQL las maneja sin problema. Un archivo JSON de 1000 registros se vuelve lento.
> 
> 4. **Seguridad**: MySQL tiene autenticación y permisos. Un archivo JSON es accesible a cualquiera que tenga acceso al servidor.
> 
> Por eso implementé la misma arquitectura de servicios separados, pero con MySQL como backend en lugar de archivos JSON."

---

## 🚀 DEMOSTRACIÓN PRÁCTICA

### Probar Servidor 1 (Servicios):
```bash
# GET - Ver servicios
curl http://localhost:3001/servicios

# POST - Agregar servicio
curl -X POST http://localhost:3001/servicios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Tinte","descripcion":"Tinte completo","precio":50,"duracion":60}'
```

### Probar Servidor 2 (Citas):
```bash
# GET - Ver citas
curl http://localhost:3002/citas

# POST - Crear cita
curl -X POST http://localhost:3002/citas \
  -H "Content-Type: application/json" \
  -d '{"cliente_nombre":"Juan","cliente_telefono":"987654321","servicio_id":1,"barbero_id":1,"fecha_cita":"2025-11-30 15:00:00"}'
```

### Probar Servidor 3 (Barberos):
```bash
# GET - Ver barberos
curl http://localhost:3003/barberos
```

---

## ✅ CONCLUSIÓN

Ambos proyectos usan la **misma arquitectura** (servicios separados en puertos diferentes), pero:

- **nuevo_node**: Usa JSON como almacenamiento (bueno para aprender)
- **Barberia_node**: Usa MySQL como almacenamiento (bueno para producción)

**Demuestras evolución** del concepto: de archivos planos a base de datos real. 🎓
