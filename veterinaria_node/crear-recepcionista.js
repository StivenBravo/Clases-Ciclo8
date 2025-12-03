const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function crearUsuarioRecepcionista() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'veterinaria_db'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Verificar si ya existe el usuario
        const [existingUser] = await connection.query(
            'SELECT id FROM usuarios WHERE username = ?',
            ['recepcionista']
        );

        if (existingUser.length > 0) {
            console.log('⚠️  El usuario recepcionista ya existe\n');
            return;
        }

        // Crear usuario recepcionista con contraseña encriptada
        const password = 'recep123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            ['recepcionista', hashedPassword, 'Recepcionista del Sistema', 'recepcionista']
        );

        console.log('✅ Usuario recepcionista creado exitosamente!\n');
        console.log('📋 Credenciales de acceso:');
        console.log('┌─────────────────────────────────┐');
        console.log('│  Usuario:    recepcionista      │');
        console.log('│  Contraseña: recep123           │');
        console.log('│  Rol:        recepcionista      │');
        console.log('└─────────────────────────────────┘\n');

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

crearUsuarioRecepcionista();
