const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function crearUsuarioAdmin() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'veterinaria_db'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Verificar si existe la tabla usuarios
        const [tables] = await connection.query("SHOW TABLES LIKE 'usuarios'");

        if (tables.length === 0) {
            console.log('📝 Creando tabla usuarios...');
            await connection.query(`
                CREATE TABLE usuarios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    nombre_completo VARCHAR(150) NOT NULL,
                    rol ENUM('admin', 'veterinario', 'recepcionista') DEFAULT 'recepcionista',
                    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
                    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ultimo_acceso TIMESTAMP NULL,
                    INDEX idx_username (username)
                )
            `);
            console.log('✅ Tabla usuarios creada\n');
        }

        // Verificar si ya existe el usuario admin
        const [existingAdmin] = await connection.query(
            'SELECT id FROM usuarios WHERE username = ?',
            ['admin']
        );

        if (existingAdmin.length > 0) {
            console.log('⚠️  El usuario admin ya existe');
            console.log('\nCredenciales actuales:');
            console.log('   Usuario: admin');
            console.log('   Contraseña: (ya configurada)\n');
            return;
        }

        // Crear usuario admin con contraseña encriptada
        const password = 'admin123'; // Cambiar esto en producción
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            ['admin', hashedPassword, 'Administrador del Sistema', 'admin']
        );

        console.log('✅ Usuario administrador creado exitosamente!\n');
        console.log('📋 Credenciales de acceso:');
        console.log('┌─────────────────────────────────┐');
        console.log('│  Usuario:    admin              │');
        console.log('│  Contraseña: admin123           │');
        console.log('│  Rol:        admin              │');
        console.log('└─────────────────────────────────┘\n');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

crearUsuarioAdmin();
