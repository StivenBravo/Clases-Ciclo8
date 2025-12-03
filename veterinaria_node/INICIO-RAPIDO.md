# 🚀 Inicio Rápido - Sistema de Gestión Veterinaria

## ⚡ Pasos para empezar

### 1️⃣ Configurar variables de entorno
Edita el archivo `.env` y configura tu contraseña de MySQL:
```env
DB_PASSWORD=tu_contraseña_mysql_aqui
```

### 2️⃣ Crear la base de datos
```bash
npm run setup
```

### 3️⃣ Iniciar todos los servicios
```bash
npm run start:all
```

### 4️⃣ Abrir el sistema
Abre tu navegador en: **http://localhost:3000**

---

## 📌 Comandos Útiles

```bash
# Configurar base de datos
npm run setup

# Iniciar todos los servicios
npm run start:all

# Iniciar solo el gateway
npm start

# Iniciar servicios individuales
npm run service:clientes
npm run service:mascotas
npm run service:citas
npm run service:productos
npm run service:trabajadores
```

---

## 🌐 URLs del Sistema

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

### Microservicios:
- Clientes: http://localhost:3001/api
- Mascotas: http://localhost:3002/api
- Citas: http://localhost:3003/api
- Productos: http://localhost:3004/api
- Trabajadores: http://localhost:3005/api

---

## 🎯 Funcionalidades Principales

✅ **Gestión de Clientes** - Registro con API RENIEC  
✅ **Gestión de Mascotas** - Historial completo  
✅ **Agenda de Citas** - Con validación de disponibilidad  
✅ **Inventario de Productos** - Control de stock  
✅ **Personal** - Veterinarios, asistentes, recepcionistas  
✅ **Tratamientos** - Historial médico de mascotas  

---

## 📊 Datos de Ejemplo Incluidos

El sistema viene con datos de prueba:
- 4 Trabajadores (2 veterinarios, 1 asistente, 1 recepcionista)
- 5 Productos de diferentes categorías

---

## 🐛 Problemas Comunes

### MySQL no se conecta
1. Verifica que MySQL esté corriendo
2. Revisa las credenciales en `.env`
3. Asegúrate que el puerto 3306 esté disponible

### Puerto ya en uso
Cambia los puertos en `.env`:
```env
PORT_GATEWAY=3000
PORT_CLIENTES=3001
# etc...
```

---

## 📚 Documentación Completa

Ver archivo `README.md` para documentación completa de la API y arquitectura.

---

## 💡 Próximos Pasos

1. Explora el dashboard y las estadísticas
2. Registra tus primeros clientes
3. Agrega mascotas a los clientes
4. Programa citas
5. Gestiona el inventario de productos

¡Listo para comenzar! 🎉
