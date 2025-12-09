const { pool } = require('../config/database');

async function updateEstadoCitas() {
    try {
        console.log('🔧 Actualizando estados de citas...\n');

        await pool.execute(`
            ALTER TABLE citas 
            MODIFY COLUMN estado ENUM('reserva', 'citada', 'atendida', 'cancelada') DEFAULT 'reserva'
        `);

        console.log('✅ Estado "citada" agregado exitosamente');
        console.log('\n📋 Flujo de estados:');
        console.log('   1. reserva → Cliente solicita cita');
        console.log('   2. citada → Admin aprueba la cita');
        console.log('   3. atendida → Cita completada');
        console.log('   4. cancelada → Cita cancelada');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateEstadoCitas();
