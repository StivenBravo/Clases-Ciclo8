const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createTestUsers() {
    try {
        console.log('🔄 Creando usuarios de prueba...\n');

        const users = [
            {
                username: 'admin',
                password: 'admin123',
                nombre_completo: 'Administrador Sistema',
                rol: 'admin'
            },
            {
                username: 'recepcion',
                password: 'recepcion123',
                nombre_completo: 'Recepcionista Principal',
                rol: 'recepcionista'
            },
            {
                username: 'drvet',
                password: 'vet123',
                nombre_completo: 'Dr. Veterinario',
                rol: 'veterinario'
            }
        ];

        for (const user of users) {
            // Verificar si el usuario ya existe
            const [existing] = await pool.execute(
                'SELECT id FROM usuarios WHERE username = ?',
                [user.username]
            );

            if (existing.length > 0) {
                console.log(`⚠️  Usuario '${user.username}' ya existe, omitiendo...`);
                continue;
            }

            // Hashear contraseña
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Insertar usuario
            await pool.execute(
                'INSERT INTO usuarios (username, password, nombre_completo, rol, estado) VALUES (?, ?, ?, ?, ?)',
                [user.username, hashedPassword, user.nombre_completo, user.rol, 'activo']
            );

            console.log(`✅ Usuario creado: ${user.username} (${user.rol}) - Contraseña: ${user.password}`);
        }

        console.log('\n✨ Proceso completado!');
        console.log('\n📋 Usuarios de prueba:');
        console.log('   - admin / admin123');
        console.log('   - recepcion / recepcion123');
        console.log('   - drvet / vet123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestUsers();
