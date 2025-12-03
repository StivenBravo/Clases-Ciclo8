const mysql = require('mysql2/promise');
require('dotenv').config();

async function actualizarEstructuraTratamientos() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'veterinaria_db'
        });

        console.log('✅ Conectado a la base de datos');

        // 1. Eliminar la clave foránea de cita_id si existe
        console.log('\n📝 Paso 1: Eliminando clave foránea cita_id...');
        try {
            await connection.query('ALTER TABLE tratamientos DROP FOREIGN KEY tratamientos_ibfk_1');
        } catch (error) {
            console.log('⚠️  Clave foránea ya eliminada o no existe');
        }

        // 2. Eliminar columnas antiguas
        console.log('\n📝 Paso 2: Eliminando columnas antiguas...');
        const columnasAEliminar = ['cita_id', 'diagnostico', 'tratamiento', 'medicamentos', 'indicaciones', 'fecha_fin'];
        for (const columna of columnasAEliminar) {
            try {
                await connection.query(`ALTER TABLE tratamientos DROP COLUMN ${columna}`);
                console.log(`✅ Columna ${columna} eliminada`);
            } catch (error) {
                console.log(`⚠️  Columna ${columna} ya eliminada o no existe`);
            }
        }

        // 3. Agregar nuevas columnas
        console.log('\n📝 Paso 3: Agregando nuevas columnas...');

        try {
            await connection.query(`
                ALTER TABLE tratamientos 
                ADD COLUMN tipo ENUM('enfermedad', 'vacuna') NOT NULL DEFAULT 'enfermedad' AFTER veterinario_id
            `);
            console.log('✅ Columna tipo agregada');
        } catch (error) {
            console.log('⚠️  Columna tipo ya existe');
        }

        try {
            await connection.query(`
                ALTER TABLE tratamientos 
                ADD COLUMN enfermedad VARCHAR(200) AFTER tipo
            `);
            console.log('✅ Columna enfermedad agregada');
        } catch (error) {
            console.log('⚠️  Columna enfermedad ya existe');
        }

        try {
            await connection.query(`
                ALTER TABLE tratamientos 
                ADD COLUMN vacuna VARCHAR(200) AFTER enfermedad
            `);
            console.log('✅ Columna vacuna agregada');
        } catch (error) {
            console.log('⚠️  Columna vacuna ya existe');
        }

        try {
            await connection.query(`
                ALTER TABLE tratamientos 
                ADD COLUMN descripcion TEXT AFTER vacuna
            `);
            console.log('✅ Columna descripcion agregada');
        } catch (error) {
            console.log('⚠️  Columna descripcion ya existe');
        }

        try {
            await connection.query(`
                ALTER TABLE tratamientos 
                ADD COLUMN fecha_proxima_visita DATE AFTER fecha_inicio
            `);
            console.log('✅ Columna fecha_proxima_visita agregada');
        } catch (error) {
            console.log('⚠️  Columna fecha_proxima_visita ya existe');
        }

        // 4. Modificar columna estado
        console.log('\n📝 Paso 4: Actualizando valores de estado...');
        await connection.query(`
            ALTER TABLE tratamientos 
            MODIFY COLUMN estado ENUM('en_curso', 'completado') DEFAULT 'en_curso'
        `);
        console.log('✅ Columna estado actualizada');

        console.log('\n✅ ¡Migración completada exitosamente!');
        console.log('\n📋 Nueva estructura:');
        console.log('   - tipo: enfermedad o vacuna');
        console.log('   - enfermedad: nombre de la enfermedad a tratar');
        console.log('   - vacuna: nombre de la vacuna a colocar');
        console.log('   - descripcion: detalles adicionales');
        console.log('   - fecha_inicio: fecha de inicio del tratamiento');
        console.log('   - fecha_proxima_visita: cuándo debe regresar');
        console.log('   - estado: en_curso o completado');

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

actualizarEstructuraTratamientos();
