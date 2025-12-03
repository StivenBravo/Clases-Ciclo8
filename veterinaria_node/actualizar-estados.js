const mysql = require('mysql2/promise');
require('dotenv').config();

async function actualizarEstados() {
    let connection;

    try {
        console.log('🔄 Conectando a la base de datos...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Conectado exitosamente\n');

        // Paso 1: Cambiar columna a VARCHAR temporalmente
        console.log('🔧 Cambiando columna estado a VARCHAR...');
        await connection.query(`
            ALTER TABLE citas 
            MODIFY COLUMN estado VARCHAR(20)
        `);
        console.log('✅ Columna cambiada a VARCHAR\n');

        // Paso 2: Actualizar valores existentes
        console.log('📝 Actualizando estados existentes...');

        await connection.query(`
            UPDATE citas 
            SET estado = CASE 
                WHEN estado IN ('pendiente', 'confirmada', 'programada') THEN 'reserva'
                WHEN estado IN ('completada', 'en_proceso', 'en_curso') THEN 'atendida'
                WHEN estado = 'cancelada' THEN 'cancelada'
                ELSE 'reserva'
            END
        `);

        console.log('✅ Estados actualizados\n');

        // Paso 3: Convertir de vuelta a ENUM con los nuevos valores
        console.log('🔧 Modificando columna a ENUM con nuevos valores...');

        await connection.query(`
            ALTER TABLE citas 
            MODIFY COLUMN estado ENUM('reserva', 'atendida', 'cancelada') DEFAULT 'reserva'
        `);

        console.log('✅ Estructura actualizada\n');

        // Verificar resultados
        const [rows] = await connection.query('SELECT estado, COUNT(*) as total FROM citas GROUP BY estado');

        console.log('📊 Resumen de estados en citas:');
        rows.forEach(row => {
            console.log(`   - ${row.estado}: ${row.total} citas`);
        });

        console.log('\n🎉 ¡Actualización completada con éxito!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
} actualizarEstados();
