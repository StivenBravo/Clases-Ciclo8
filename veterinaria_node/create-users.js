const bcrypt = require('bcrypt');
const { pool } = require('./config/database');

async function createUsers() {
    try {
        console.log('Creando usuarios de ejemplo...\n');

        // Hashear contraseñas
        const adminPassword = await bcrypt.hash('admin123', 10);
        const recepcionPassword = await bcrypt.hash('recepcion123', 10);
        const vetPassword = await bcrypt.hash('vet123', 10);

        // Verificar si los usuarios ya existen
        const [existingUsers] = await pool.query(
            'SELECT username FROM usuarios WHERE username IN (?, ?, ?)',
            ['admin', 'recepcion', 'drvet']
        );

        if (existingUsers.length > 0) {
            console.log('Los usuarios ya existen. Actualizando contraseñas...\n');

            // Actualizar contraseñas
            await pool.query('UPDATE usuarios SET password = ? WHERE username = ?', [adminPassword, 'admin']);
            await pool.query('UPDATE usuarios SET password = ? WHERE username = ?', [recepcionPassword, 'recepcion']);
            await pool.query('UPDATE usuarios SET password = ? WHERE username = ?', [vetPassword, 'drvet']);

            console.log('✅ Contraseñas actualizadas exitosamente\n');
        } else {
            // Crear usuarios
            await pool.query(
                'INSERT INTO usuarios (username, password, nombre_completo, rol, estado) VALUES (?, ?, ?, ?, ?)',
                ['admin', adminPassword, 'Administrador Sistema', 'admin', 'activo']
            );

            await pool.query(
                'INSERT INTO usuarios (username, password, nombre_completo, rol, estado) VALUES (?, ?, ?, ?, ?)',
                ['recepcion', recepcionPassword, 'Recepcionista Principal', 'recepcionista', 'activo']
            );

            await pool.query(
                'INSERT INTO usuarios (username, password, nombre_completo, rol, estado) VALUES (?, ?, ?, ?, ?)',
                ['drvet', vetPassword, 'Dr. Veterinario', 'veterinario', 'activo']
            );

            console.log('✅ Usuarios creados exitosamente\n');
        }

        // Mostrar información de los usuarios
        console.log('📋 Usuarios disponibles:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 Usuario: admin');
        console.log('   Contraseña: admin123');
        console.log('   Rol: Administrador (acceso al panel)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 Usuario: recepcion');
        console.log('   Contraseña: recepcion123');
        console.log('   Rol: Recepcionista (acceso al home)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 Usuario: drvet');
        console.log('   Contraseña: vet123');
        console.log('   Rol: Veterinario (acceso al home)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await pool.end();
        console.log('Proceso completado exitosamente');
        process.exit(0);

    } catch (error) {
        console.error('Error al crear usuarios:', error.message);
        process.exit(1);
    }
}

createUsers();
