const { pool } = require('../config/database');

async function verifyDatabase() {
    try {
        console.log('🔍 Verificando estructura de la base de datos...\n');

        // Verificar tabla usuarios
        console.log('📋 Tabla: usuarios');
        const [usuariosColumns] = await pool.execute('SHOW COLUMNS FROM usuarios');
        console.log('   Columnas:');
        usuariosColumns.forEach(col => {
            console.log(`   - ${col.Field} (${col.Type})`);
        });

        const [rolEnum] = await pool.execute(
            "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'veterinaria_db' AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'rol'"
        );
        console.log(`   Valores de rol: ${rolEnum[0].COLUMN_TYPE}\n`);

        // Verificar tabla clientes
        console.log('📋 Tabla: clientes');
        const [clientesColumns] = await pool.execute('SHOW COLUMNS FROM clientes');
        console.log('   Columnas:');
        clientesColumns.forEach(col => {
            console.log(`   - ${col.Field} (${col.Type})`);
        });

        // Verificar foreign key
        const [fks] = await pool.execute(
            `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
             WHERE TABLE_NAME = 'clientes' AND REFERENCED_TABLE_NAME IS NOT NULL`
        );
        console.log('\n   Foreign Keys:');
        fks.forEach(fk => {
            console.log(`   - ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });

        // Contar registros
        console.log('\n📊 Conteo de registros:');
        const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM usuarios');
        console.log(`   - Usuarios: ${userCount[0].total}`);

        const [clientCount] = await pool.execute('SELECT COUNT(*) as total FROM clientes');
        console.log(`   - Clientes: ${clientCount[0].total}`);

        const [mascotaCount] = await pool.execute('SELECT COUNT(*) as total FROM mascotas');
        console.log(`   - Mascotas: ${mascotaCount[0].total}`);

        const [citaCount] = await pool.execute('SELECT COUNT(*) as total FROM citas');
        console.log(`   - Citas: ${citaCount[0].total}`);

        const [productoCount] = await pool.execute('SELECT COUNT(*) as total FROM productos');
        console.log(`   - Productos: ${productoCount[0].total}`);

        console.log('\n✅ Verificación completada!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyDatabase();
