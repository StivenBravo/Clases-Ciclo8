const { pool } = require('../config/database');

async function setupTurnosDoctores() {
    try {
        console.log('🔧 Configurando sistema de turnos de doctores...\n');

        // 1. Agregar columna turno a trabajadores si no existe
        console.log('📋 Agregando columna turno a trabajadores...');
        try {
            await pool.execute(`
                ALTER TABLE trabajadores 
                ADD COLUMN turno ENUM('mañana', 'tarde', 'ambos') DEFAULT NULL
            `);
            console.log('✓ Columna turno agregada');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Columna turno ya existe');
            } else throw error;
        }

        // 2. Crear tabla para dias de trabajo de doctores
        console.log('\n📋 Creando tabla turnos_doctores...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS turnos_doctores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                trabajador_id INT NOT NULL,
                dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') NOT NULL,
                activo BOOLEAN DEFAULT TRUE,
                fecha_inicio DATE NULL,
                fecha_fin DATE NULL,
                FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id) ON DELETE CASCADE,
                UNIQUE KEY unique_doctor_day (trabajador_id, dia_semana)
            )
        `);
        console.log('✓ Tabla turnos_doctores creada');

        // 3. Limpiar trabajadores existentes que no sean veterinarios
        console.log('\n🧹 Limpiando datos existentes...');
        await pool.execute(`DELETE FROM trabajadores WHERE cargo != 'veterinario'`);
        await pool.execute(`DELETE FROM trabajadores WHERE cargo = 'veterinario'`);
        console.log('✓ Datos limpiados');

        // 4. Crear 5 doctores con turnos específicos
        console.log('\n👨‍⚕️ Creando doctores con turnos...\n');

        const doctores = [
            // 3 doctores de turno mañana (8:00 - 16:00)
            {
                dni: '11111111',
                nombres: 'Carlos',
                apellidos: 'Mendoza Ruiz',
                turno: 'mañana',
                especialidad: 'Medicina General',
                telefono: '987654321',
                email: 'cmendoza@vet.com',
                dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] // Descansa Sáb-Dom
            },
            {
                dni: '22222222',
                nombres: 'María',
                apellidos: 'García López',
                turno: 'mañana',
                especialidad: 'Cirugía Veterinaria',
                telefono: '987654322',
                email: 'mgarcia@vet.com',
                dias: ['Lunes', 'Martes', 'Miércoles', 'Sábado', 'Domingo'] // Descansa Jue-Vie
            },
            {
                dni: '33333333',
                nombres: 'Luis',
                apellidos: 'Torres Vega',
                turno: 'mañana',
                especialidad: 'Dermatología',
                telefono: '987654323',
                email: 'ltorres@vet.com',
                dias: ['Jueves', 'Viernes', 'Sábado', 'Domingo', 'Lunes'] // Descansa Mar-Mié
            },
            // 2 doctores de turno tarde (12:00 - 20:00)
            {
                dni: '44444444',
                nombres: 'Ana',
                apellidos: 'Salazar Díaz',
                turno: 'tarde',
                especialidad: 'Oftalmología',
                telefono: '987654324',
                email: 'asalazar@vet.com',
                dias: ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] // Descansa Dom-Lun
            },
            {
                dni: '55555555',
                nombres: 'Roberto',
                apellidos: 'Campos Ruiz',
                turno: 'tarde',
                especialidad: 'Traumatología',
                telefono: '987654325',
                email: 'rcampos@vet.com',
                dias: ['Lunes', 'Martes', 'Domingo', 'Sábado', 'Viernes'] // Descansa Mié-Jue
            }
        ];

        for (const doctor of doctores) {
            // Insertar doctor
            const [result] = await pool.execute(`
                INSERT INTO trabajadores 
                (dni, nombres, apellidos, cargo, especialidad, telefono, email, fecha_contratacion, salario, turno, estado)
                VALUES (?, ?, ?, 'veterinario', ?, ?, ?, CURDATE(), 3500.00, ?, 'activo')
            `, [doctor.dni, doctor.nombres, doctor.apellidos, doctor.especialidad,
            doctor.telefono, doctor.email, doctor.turno]);

            const trabajadorId = result.insertId;

            // Insertar días de trabajo
            for (const dia of doctor.dias) {
                await pool.execute(`
                    INSERT INTO turnos_doctores (trabajador_id, dia_semana, activo)
                    VALUES (?, ?, TRUE)
                `, [trabajadorId, dia]);
            }

            const turnoLabel = doctor.turno === 'mañana' ? '8:00-16:00' : '12:00-20:00';
            console.log(`✓ Dr(a). ${doctor.nombres} ${doctor.apellidos}`);
            console.log(`  Turno: ${doctor.turno} (${turnoLabel})`);
            console.log(`  Días: ${doctor.dias.join(', ')}`);
            console.log('');
        }

        // 5. Mostrar resumen
        console.log('\n📊 Resumen de cobertura:');
        console.log('═══════════════════════════════════════════════════════════');

        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        for (const dia of dias) {
            const [mañana] = await pool.execute(`
                SELECT COUNT(*) as total
                FROM trabajadores t
                INNER JOIN turnos_doctores td ON t.id = td.trabajador_id
                WHERE td.dia_semana = ? AND t.turno = 'mañana' AND td.activo = TRUE
            `, [dia]);

            const [tarde] = await pool.execute(`
                SELECT COUNT(*) as total
                FROM trabajadores t
                INNER JOIN turnos_doctores td ON t.id = td.trabajador_id
                WHERE td.dia_semana = ? AND t.turno = 'tarde' AND td.activo = TRUE
            `, [dia]);

            const totalMañana = mañana[0].total;
            const totalTarde = tarde[0].total;
            const solapamiento = Math.min(totalMañana, totalTarde);

            console.log(`${dia.padEnd(12)} | Mañana: ${totalMañana} | Tarde: ${totalTarde} | Solapa (12-16h): ${solapamiento}`);
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log('\n✅ Sistema de turnos configurado exitosamente!');
        console.log('\n📋 Horarios:');
        console.log('   Turno Mañana: 8:00 - 16:00');
        console.log('   Turno Tarde:  12:00 - 20:00');
        console.log('   Solapamiento: 12:00 - 16:00 (Mayor capacidad)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupTurnosDoctores();
