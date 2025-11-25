# 🚀 GUÍA RÁPIDA - BarberShop Pro

## ¿Qué tiene este proyecto?

Este proyecto tiene **5 SERVICIOS SEPARADOS** (como tu ejemplo de nuevo_node) pero usando **MYSQL en vez de JSON**.

## 📂 Archivos principales:

- `server1.js` - Servidor de SERVICIOS (puerto 3001) → Lee de MySQL tabla `servicios`
- `server2.js` - Servidor de CITAS (puerto 3002) → Lee de MySQL tabla `citas`
- `server3.js` - Servidor de BARBEROS (puerto 3003) → Lee de MySQL tabla `barberos`
- `server4.js` - Servidor de PRODUCTOS (puerto 3004) → Lee de MySQL tabla `productos`
- `server5.js` - Servidor de HORARIOS (puerto 3005) → Lee de MySQL tabla `horarios`
- `server.js` - Servidor WEB principal (puerto 3000) → Interfaz HTML
- `database.sql` - Script para crear la base de datos con 5 tablas

## 🔥 Diferencia con nuevo_node:

| nuevo_node | Barberia_node |
|------------|---------------|
| Lee de `server1.json` | Lee de MySQL tabla `servicios` |
| Lee de `server2.json` | Lee de MySQL tabla `citas` |
| Lee de `server3.json` | Lee de MySQL tabla `barberos` |
| ❌ No tiene más | ✅ Lee de MySQL tabla `productos` |
| ❌ No tiene más | ✅ Lee de MySQL tabla `horarios` |

## ⚡ Cómo ejecutar:

### 1. Crear la base de datos
Ejecuta `database.sql` en phpMyAdmin o MySQL Workbench

### 2. Configurar credenciales
Edita en `server1.js`, `server2.js`, `server3.js`:
```javascript
password: 'root',  // Tu contraseña de MySQL
```

### 3. Iniciar todo de una vez
```bash
npm run todos
```

**O iniciar cada servidor por separado** (6 terminales):
```bash
npm run server1   # Terminal 1 - Servicios
npm run server2   # Terminal 2 - Citas
npm run server3   # Terminal 3 - Barberos
npm run server4   # Terminal 4 - Productos
npm run server5   # Terminal 5 - Horarios
npm start         # Terminal 6 - Interfaz Web
```

### 4. Abrir navegador
```
http://localhost:3000
```

## 🎯 Para explicar al profesor:

**"Implementé 5 servicios REST independientes con Node.js que se comunican de forma separada, similar a una arquitectura de microservicios. En lugar de usar archivos JSON como almacenamiento, utilicé una base de datos MySQL para demostrar la integración con gestores de bases de datos relacionales. Cada servicio corre en un puerto diferente y maneja una responsabilidad específica: servicios de barbería, gestión de citas, registro de barberos, catálogo de productos y horarios disponibles. La interfaz web consume estos 5 servicios de forma asíncrona usando Fetch API."**

## 📌 Puertos:

- `3000` → Página web (HTML/CSS/JS)
- `3001` → API de servicios (GET, POST)
- `3002` → API de citas (GET, POST)
- `3003` → API de barberos (GET)
- `3004` → API de productos (GET, POST, PUT)
- `3005` → API de horarios (GET, POST, PUT)

## ✅ Ventajas para tu presentación:

1. **5 servicios separados** → Demuestra arquitectura distribuida
2. **MySQL real** → No usa JSON
3. **GET, POST y PUT** → Demuestra CRUD completo
4. **Código simple** → Fácil de explicar
5. **Funcional** → Realmente guarda en BD
6. **Relaciones** → Usa Foreign Keys y JOINs

---

**¡Listo para presentar!** 🎓
