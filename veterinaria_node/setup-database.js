const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🔧 Configurando base de datos...\n');

    try {
        // Conexión sin seleccionar base de datos
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✅ Conectado a MySQL');

        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'database.sql');
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');

        // Ejecutar el script SQL
        console.log('📝 Ejecutando script SQL...');
        await connection.query(sqlScript);

        console.log('✅ Base de datos creada exitosamente');
        console.log('✅ Tablas creadas');
        console.log('✅ Datos de ejemplo insertados\n');

        // Verificar las tablas creadas
        await connection.query(`USE ${process.env.DB_NAME || 'veterinaria_db'}`);
        const [tables] = await connection.query('SHOW TABLES');

        console.log('📊 Tablas en la base de datos:');
        tables.forEach((table, index) => {
            console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
        });

        await connection.end();

        console.log('\n🎉 ¡Configuración completada con éxito!');
        console.log('\n💡 Ahora puedes iniciar el sistema con: npm run start:all\n');

    } catch (error) {
        console.error('❌ Error al configurar la base de datos:', error.message);
        console.error('\n💡 Verifica que:');
        console.error('   1. MySQL esté corriendo');
        console.error('   2. Las credenciales en .env sean correctas');
        console.error('   3. El usuario tenga permisos para crear bases de datos\n');
        process.exit(1);
    }
}

// Ejecutar la configuración
setupDatabase();
