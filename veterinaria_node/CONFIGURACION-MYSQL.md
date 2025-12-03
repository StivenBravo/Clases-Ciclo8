# 🔧 Guía de Configuración de MySQL

## 📝 Requisitos Previos

- MySQL Server 5.7 o superior instalado
- Cliente MySQL (MySQL Workbench, phpMyAdmin, o línea de comandos)
- Credenciales de administrador de MySQL

---

## 🚀 Método 1: Configuración Automática (Recomendado)

### Paso 1: Configurar el archivo .env

Abre el archivo `.env` y edita estas líneas:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_AQUI  # 👈 Cambia esto
DB_NAME=veterinaria_db
DB_PORT=3306
```

### Paso 2: Ejecutar el script de setup

```bash
npm run setup
```

Este comando:
- ✅ Se conecta a MySQL
- ✅ Crea la base de datos `veterinaria_db`
- ✅ Crea todas las tablas
- ✅ Inserta datos de ejemplo
- ✅ Verifica la instalación

**Salida esperada**:
```
🔧 Configurando base de datos...

✅ Conectado a MySQL
📝 Ejecutando script SQL...
✅ Base de datos creada exitosamente
✅ Tablas creadas
✅ Datos de ejemplo insertados

📊 Tablas en la base de datos:
   1. citas
   2. clientes
   3. detalle_ventas
   4. mascotas
   5. productos
   6. trabajadores
   7. tratamientos
   8. ventas

🎉 ¡Configuración completada con éxito!

💡 Ahora puedes iniciar el sistema con: npm run start:all
```

---

## 🔨 Método 2: Configuración Manual

### Opción A: MySQL Workbench

1. **Abrir MySQL Workbench**
2. **Conectar a tu servidor MySQL**
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: tu contraseña

3. **Abrir el archivo SQL**
   - File → Open SQL Script
   - Seleccionar `database.sql`

4. **Ejecutar el script**
   - Clic en el icono del rayo (⚡) o presionar `Ctrl+Shift+Enter`

5. **Verificar**
   ```sql
   USE veterinaria_db;
   SHOW TABLES;
   ```

### Opción B: Línea de Comandos

```bash
# 1. Conectar a MySQL
mysql -u root -p

# 2. Ingresar contraseña cuando se solicite

# 3. Crear y usar la base de datos
mysql> source C:\Users\bravo\dev\clases-ciclo8\veterinaria_node\database.sql

# 4. Verificar
mysql> USE veterinaria_db;
mysql> SHOW TABLES;
mysql> exit;
```

### Opción C: Desde PowerShell (Una sola línea)

```powershell
# Reemplaza 'tu_contraseña' con tu contraseña de MySQL
Get-Content database.sql | mysql -u root -ptu_contraseña
```

### Opción D: phpMyAdmin

1. Abrir phpMyAdmin en el navegador
2. Ir a la pestaña **Import**
3. Seleccionar el archivo `database.sql`
4. Clic en **Go**

---

## 🔍 Verificación de la Instalación

### Verificar que la BD existe

```sql
SHOW DATABASES LIKE 'veterinaria_db';
```

### Verificar las tablas

```sql
USE veterinaria_db;
SHOW TABLES;
```

**Deberías ver 8 tablas**:
```
+---------------------------+
| Tables_in_veterinaria_db  |
+---------------------------+
| citas                     |
| clientes                  |
| detalle_ventas            |
| mascotas                  |
| productos                 |
| trabajadores              |
| tratamientos              |
| ventas                    |
+---------------------------+
```

### Verificar datos de ejemplo

```sql
-- Ver trabajadores
SELECT id, nombres, apellidos, cargo FROM trabajadores;

-- Ver productos
SELECT codigo, nombre, precio_venta, stock FROM productos;
```

---

## 🐛 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"

**Causa**: Contraseña incorrecta en `.env`

**Solución**:
1. Verifica tu contraseña de MySQL
2. Actualiza el archivo `.env`
3. Intenta de nuevo

```env
DB_PASSWORD=tu_contraseña_correcta
```

### Error: "Can't connect to MySQL server"

**Causa**: MySQL no está corriendo

**Solución Windows**:
1. Abre Servicios (Win+R → `services.msc`)
2. Busca "MySQL" o "MySQL80"
3. Clic derecho → Iniciar

**Solución verificar estado**:
```bash
# Ver estado del servicio
Get-Service -Name MySQL*
```

### Error: "Database 'veterinaria_db' doesn't exist"

**Causa**: La base de datos no se creó correctamente

**Solución**:
```bash
# Ejecutar el setup nuevamente
npm run setup
```

### Error: "Table 'veterinaria_db.clientes' doesn't exist"

**Causa**: Las tablas no se crearon

**Solución**:
```sql
-- Borrar la BD y recrear
DROP DATABASE IF EXISTS veterinaria_db;

-- Luego ejecutar el script SQL completo nuevamente
```

### Error al ejecutar npm run setup: "Cannot find module 'mysql2'"

**Causa**: Dependencias no instaladas

**Solución**:
```bash
npm install
npm run setup
```

---

## 🔐 Cambiar Configuración de MySQL

### Cambiar Puerto

Si MySQL corre en otro puerto (ej: 3307):

**Archivo .env**:
```env
DB_PORT=3307
```

### Usar otro usuario

Si quieres usar un usuario diferente a root:

**Archivo .env**:
```env
DB_USER=mi_usuario
DB_PASSWORD=mi_contraseña
```

**Dar permisos al usuario**:
```sql
-- Conectar como root primero
CREATE USER 'mi_usuario'@'localhost' IDENTIFIED BY 'mi_contraseña';
GRANT ALL PRIVILEGES ON veterinaria_db.* TO 'mi_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### Conectar a MySQL Remoto

Si MySQL está en otro servidor:

**Archivo .env**:
```env
DB_HOST=192.168.1.100  # IP del servidor
DB_USER=remote_user
DB_PASSWORD=contraseña
DB_NAME=veterinaria_db
DB_PORT=3306
```

---

## 📊 Estructura de la Base de Datos

### Tablas y sus Relaciones

```
clientes
   ↓ (1:N)
mascotas
   ↓ (1:N)
   ├─→ citas ←─ trabajadores
   └─→ tratamientos ←─ trabajadores
           ↑
           └─ citas (1:1)

productos
   ↓ (1:N)
detalle_ventas
   ↑ (N:1)
ventas ←─ clientes
      ←─ trabajadores
```

### Datos de Ejemplo Incluidos

**Trabajadores (4 registros)**:
1. Carlos Mendoza Ruiz - Veterinario (Medicina General)
2. Ana García López - Veterinario (Cirugía)
3. Luis Torres Vega - Asistente
4. María Salazar Díaz - Recepcionista

**Productos (5 registros)**:
1. Alimento Premium Adulto - S/ 120.00
2. Vacuna Séxtuple - S/ 45.00
3. Collar Antipulgas - S/ 30.00
4. Shampoo Medicado - S/ 25.00
5. Pelota Interactiva - S/ 18.00

---

## 🧪 Probar la Conexión

### Desde Node.js

Crear un archivo de prueba `test-db.js`:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('✅ Conexión exitosa a MySQL');
        
        const [rows] = await connection.query('SELECT COUNT(*) as total FROM clientes');
        console.log(`📊 Total de clientes: ${rows[0].total}`);
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testConnection();
```

Ejecutar:
```bash
node test-db.js
```

---

## 🔄 Resetear la Base de Datos

Si necesitas empezar de cero:

### Método 1: Desde la aplicación
```bash
npm run setup
```
(El script detecta y recrea la BD si ya existe)

### Método 2: Manual
```sql
-- Borrar todo
DROP DATABASE IF EXISTS veterinaria_db;

-- Ejecutar el script nuevamente
source database.sql;
```

### Método 3: Solo borrar datos, mantener estructura
```sql
USE veterinaria_db;

-- Borrar datos (orden importante por Foreign Keys)
DELETE FROM detalle_ventas;
DELETE FROM ventas;
DELETE FROM tratamientos;
DELETE FROM citas;
DELETE FROM mascotas;
DELETE FROM clientes;
DELETE FROM productos;
DELETE FROM trabajadores;

-- Reiniciar auto_increment
ALTER TABLE clientes AUTO_INCREMENT = 1;
ALTER TABLE mascotas AUTO_INCREMENT = 1;
ALTER TABLE citas AUTO_INCREMENT = 1;
-- etc...
```

---

## 📚 Consultas Útiles

### Ver todos los clientes con sus mascotas
```sql
SELECT 
    c.nombres, 
    c.apellido_paterno,
    m.nombre as mascota,
    m.especie
FROM clientes c
LEFT JOIN mascotas m ON c.id = m.cliente_id
WHERE c.estado = 'activo';
```

### Ver citas del día de hoy
```sql
SELECT 
    c.fecha_cita,
    m.nombre as mascota,
    cl.nombres as cliente,
    t.nombres as veterinario,
    c.estado
FROM citas c
JOIN mascotas m ON c.mascota_id = m.id
JOIN clientes cl ON m.cliente_id = cl.id
JOIN trabajadores t ON c.veterinario_id = t.id
WHERE DATE(c.fecha_cita) = CURDATE()
ORDER BY c.fecha_cita;
```

### Productos con stock bajo
```sql
SELECT 
    codigo,
    nombre,
    stock,
    stock_minimo,
    precio_venta
FROM productos
WHERE stock <= stock_minimo
  AND estado = 'disponible';
```

---

## 🎯 Siguiente Paso

Una vez configurada la base de datos:

```bash
# Iniciar todos los servicios
npm run start:all

# Abrir en el navegador
http://localhost:3000
```

---

## 💡 Tips Adicionales

1. **Backup regular**:
   ```bash
   mysqldump -u root -p veterinaria_db > backup.sql
   ```

2. **Restaurar backup**:
   ```bash
   mysql -u root -p veterinaria_db < backup.sql
   ```

3. **Ver logs de MySQL**:
   - Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\`
   - Linux: `/var/log/mysql/error.log`

4. **Optimizar tablas**:
   ```sql
   OPTIMIZE TABLE clientes, mascotas, citas;
   ```

---

Para más ayuda, consultar:
- README.md - Documentación completa
- INICIO-RAPIDO.md - Guía de inicio
- EJEMPLOS-API.md - Ejemplos de uso

¡Listo para comenzar! 🚀
