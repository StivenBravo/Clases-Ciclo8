# 🔄 Migrar Proyecto a Otra Máquina

## Método Recomendado (SQL Puro)

### 1️⃣ En la máquina ACTUAL:

**Exportar la base de datos:**
```bash
mysqldump -u root -p veterinaria_db > backup-veterinaria.sql
```

O usa el script:
```bash
node export-db.js
```

### 2️⃣ En la máquina NUEVA:

**Copiar archivos del proyecto:**
- Copia toda la carpeta `veterinaria_node`
- Incluye el archivo `backup-veterinaria.sql` generado

**Instalar dependencias:**
```bash
npm install
```

**Configurar variables de entorno (.env):**
- Verifica que el archivo `.env` tenga la configuración correcta de MySQL
- Ajusta DB_PASSWORD si es diferente

**Importar la base de datos:**
```bash
mysql -u root -p < backup-veterinaria.sql
```

O usa el script:
```bash
node import-db.js
```

**Iniciar servicios:**
```bash
npm start
```

---

## Método Alternativo (Con scripts Node.js)

Si no tienes mysql/mysqldump en PATH, los scripts export-db.js e import-db.js intentarán ejecutar los comandos, pero mostrarán los comandos manuales si fallan.

---

## ⚠️ Importante

**Archivos que DEBES copiar:**
- ✅ Todo el proyecto (código, node_modules se reinstala)
- ✅ `backup-veterinaria.sql` (base de datos)
- ✅ `.env` (configuración)
- ✅ `package.json` y `package-lock.json`

**No es necesario copiar:**
- ❌ `node_modules/` (se reinstala con npm install)

---

## 🔍 Verificar que todo funciona

1. Base de datos importada:
```bash
mysql -u root -p -e "USE veterinaria_db; SHOW TABLES;"
```

2. Servicios corriendo:
```bash
npm start
```

3. Probar en navegador:
- http://localhost:3000 (Home)
- http://localhost:3000/login (Login/Registro)
- http://localhost:3000/panel (Admin)

---

## 📝 Notas

- Si usas XAMPP, la ruta de mysql es: `C:\xampp\mysql\bin\mysql.exe`
- Si usas WAMP, la ruta es: `C:\wamp64\bin\mysql\mysql[version]\bin\mysql.exe`
- Puedes agregar estas rutas al PATH de Windows para usar los comandos directamente
