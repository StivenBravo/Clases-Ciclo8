const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function pregunta(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function crearNuevoUsuario() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'veterinaria_db'
        });

        console.log('✅ Conectado a la base de datos\n');
        console.log('═══════════════════════════════════════════════');
        console.log('    CREADOR DE USUARIOS - SISTEMA VETERINARIA');
        console.log('═══════════════════════════════════════════════\n');

        // Solicitar datos del usuario
        const username = await pregunta('👤 Nombre de usuario: ');

        // Verificar si ya existe
        const [existingUser] = await connection.query(
            'SELECT id FROM usuarios WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            console.log('\n❌ El usuario ya existe. Intenta con otro nombre.\n');
            rl.close();
            return;
        }

        const password = await pregunta('🔒 Contraseña: ');
        const nombreCompleto = await pregunta('📝 Nombre completo: ');

        console.log('\n📋 Selecciona el rol:');
        console.log('   1. Administrador');
        console.log('   2. Veterinario');
        console.log('   3. Recepcionista');
        const rolOpcion = await pregunta('\nOpción (1-3): ');

        const roles = { '1': 'admin', '2': 'veterinario', '3': 'recepcionista' };
        const rol = roles[rolOpcion] || 'recepcionista';

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        await connection.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, nombreCompleto, rol]
        );

        console.log('\n═══════════════════════════════════════════════');
        console.log('✅ Usuario creado exitosamente!');
        console.log('═══════════════════════════════════════════════');
        console.log('\n📋 Credenciales de acceso:');
        console.log(`   Usuario:    ${username}`);
        console.log(`   Contraseña: ${password}`);
        console.log(`   Rol:        ${rol}`);
        console.log(`   Nombre:     ${nombreCompleto}\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
        rl.close();
    }
}

crearNuevoUsuario();
