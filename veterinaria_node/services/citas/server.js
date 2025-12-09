const express = require('express');
const cors = require('cors');
const { pool } = require('../../config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_CITAS || 3003;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Citas', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test-disponibilidad', async (req, res) => {
    try {
        // Prueba simple de veterinarios
        const [vets] = await pool.query('SELECT COUNT(*) as total FROM trabajadores WHERE cargo = "veterinario"');
        const [turnos] = await pool.query('SELECT COUNT(*) as total FROM turnos_doctores');

        res.json({
            success: true,
            veterinarios_count: vets[0].total,
            turnos_count: turnos[0].total,
            message: 'Prueba de conexión exitosa'
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// GET - Disponibilidad de horarios (DEBE IR ANTES DE :id)
app.get('/api/citas/disponibilidad', async (req, res) => {
    try {
        console.log('=== Endpoint /api/citas/disponibilidad llamado ===');

        // Obtener citas de la semana actual (8am a 8pm)
        const [citas] = await pool.query(`
            SELECT fecha_cita, veterinario_id, estado
            FROM citas
            WHERE fecha_cita >= CURDATE() 
            AND fecha_cita < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            AND estado IN ('reserva', 'citada', 'atendida')
            AND HOUR(fecha_cita) >= 8 
            AND HOUR(fecha_cita) < 20
            ORDER BY fecha_cita ASC
        `);
        console.log('Citas encontradas:', citas.length);

        // Obtener veterinarios activos con sus turnos y días de trabajo
        const [veterinarios] = await pool.query(`
            SELECT 
                t.id, 
                t.nombres, 
                t.apellidos, 
                t.especialidad,
                t.turno,
                GROUP_CONCAT(td.dia_semana ORDER BY 
                    FIELD(td.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')
                ) as dias_trabajo
            FROM trabajadores t
            LEFT JOIN turnos_doctores td ON t.id = td.trabajador_id AND td.activo = TRUE
            WHERE t.cargo = 'veterinario' AND t.estado = 'activo'
            GROUP BY t.id, t.nombres, t.apellidos, t.especialidad, t.turno
            ORDER BY t.nombres
        `);
        console.log('Veterinarios encontrados:', veterinarios.length);

        const response = {
            success: true,
            data: {
                citas: citas,
                veterinarios: veterinarios.map(v => ({
                    ...v,
                    dias_trabajo: v.dias_trabajo ? v.dias_trabajo.split(',') : []
                }))
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error en /api/citas/disponibilidad:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Doctores disponibles (DEBE IR ANTES DE :id)
app.get('/api/citas/doctores-disponibles', async (req, res) => {
    try {
        const { fecha, hora } = req.query;
        if (!fecha || !hora) {
            return res.status(400).json({ success: false, message: 'Se requiere fecha y hora' });
        }

        const fechaCita = new Date(`${fecha}T${hora}:00`);
        const horaNum = parseInt(hora);
        const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fechaCita.getDay()];

        let turnoRequerido = '';
        if (horaNum >= 8 && horaNum < 12) turnoRequerido = 'mañana';
        else if (horaNum >= 12 && horaNum < 16) turnoRequerido = 'ambos';
        else if (horaNum >= 16 && horaNum < 20) turnoRequerido = 'tarde';

        let query = `
            SELECT t.id, t.nombres, t.apellidos, t.especialidad, t.turno
            FROM trabajadores t
            INNER JOIN turnos_doctores td ON t.id = td.trabajador_id
            WHERE t.cargo = 'veterinario' AND t.estado = 'activo'
            AND td.dia_semana = ? AND td.activo = TRUE
        `;

        if (turnoRequerido === 'ambos') query += ` AND t.turno IN ('mañana', 'tarde')`;
        else query += ` AND t.turno = ?`;
        query += ` ORDER BY t.nombres`;

        const params = turnoRequerido === 'ambos' ? [diaSemana] : [diaSemana, turnoRequerido];
        const [doctores] = await pool.query(query, params);

        res.json({ success: true, data: doctores, turno: turnoRequerido, dia: diaSemana });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Citas del día (DEBE IR ANTES DE :id)
app.get('/api/citas/fecha/hoy', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, 
                   m.nombre as mascota_nombre, m.especie,
                   cl.nombres, cl.apellido_paterno, cl.apellido_materno, cl.telefono,
                   t.nombres as vet_nombres, t.apellidos as vet_apellidos
            FROM citas c
            INNER JOIN mascotas m ON c.mascota_id = m.id
            INNER JOIN clientes cl ON m.cliente_id = cl.id
            INNER JOIN trabajadores t ON c.veterinario_id = t.id
            WHERE DATE(c.fecha_cita) = CURDATE()
            ORDER BY c.fecha_cita ASC
        `);

        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Citas de una mascota (DEBE IR ANTES DE :id)
app.get('/api/citas/mascota/:mascotaId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, t.nombres as vet_nombres, t.apellidos as vet_apellidos
            FROM citas c
            INNER JOIN trabajadores t ON c.veterinario_id = t.id
            WHERE c.mascota_id = ?
            ORDER BY c.fecha_cita DESC
        `, [req.params.mascotaId]);

        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Listar todas las citas
app.get('/api/citas', async (req, res) => {
    try {
        const { fecha, estado, veterinario_id } = req.query;
        let query = `
            SELECT c.*, 
                   m.nombre as mascota_nombre, m.especie,
                   cl.nombres, cl.apellido_paterno, cl.apellido_materno, cl.telefono,
                   t.nombres as vet_nombres, t.apellidos as vet_apellidos
            FROM citas c
            INNER JOIN mascotas m ON c.mascota_id = m.id
            INNER JOIN clientes cl ON m.cliente_id = cl.id
            INNER JOIN trabajadores t ON c.veterinario_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (fecha) {
            query += ' AND DATE(c.fecha_cita) = ?';
            params.push(fecha);
        }
        if (estado) {
            query += ' AND c.estado = ?';
            params.push(estado);
        }
        if (veterinario_id) {
            query += ' AND c.veterinario_id = ?';
            params.push(veterinario_id);
        }

        query += ' ORDER BY c.fecha_cita DESC';

        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Obtener cita por ID (DEBE IR AL FINAL)
app.get('/api/citas/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, 
                   m.nombre as mascota_nombre, m.especie, m.raza,
                   cl.nombres, cl.apellido_paterno, cl.apellido_materno, cl.telefono, cl.email,
                   t.nombres as vet_nombres, t.apellidos as vet_apellidos, t.especialidad
            FROM citas c
            INNER JOIN mascotas m ON c.mascota_id = m.id
            INNER JOIN clientes cl ON m.cliente_id = cl.id
            INNER JOIN trabajadores t ON c.veterinario_id = t.id
            WHERE c.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Reservar cita desde el frontend (clientes registrados)
app.post('/api/citas/reservar', async (req, res) => {
    try {
        const { dni, nombre_mascota, especie, veterinario_id, fecha_cita, motivo, tipo } = req.body;

        console.log('📝 Solicitud de reserva recibida:', req.body);

        // Validar campos requeridos
        if (!dni || !nombre_mascota || !especie || !veterinario_id || !fecha_cita || !motivo || !tipo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Validar horario de atención (8am a 8pm)
        // Extraer hora directamente del string para evitar problemas de zona horaria
        const hora = parseInt(fecha_cita.split(' ')[1].split(':')[0]);

        if (hora < 8 || hora >= 20) {
            return res.status(400).json({
                success: false,
                message: 'El horario de atención es de 8:00 AM a 8:00 PM'
            });
        }

        // Buscar cliente por DNI
        const [cliente] = await pool.query('SELECT id, usuario_id FROM clientes WHERE dni = ? AND estado = "activo"', [dni]);

        if (cliente.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado. Debe registrarse primero.'
            });
        }

        const cliente_id = cliente[0].id;

        // Verificar que el veterinario existe
        const [veterinario] = await pool.query(
            'SELECT id FROM trabajadores WHERE id = ? AND cargo = "veterinario" AND estado = "activo"',
            [veterinario_id]
        );

        if (veterinario.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Veterinario no encontrado'
            });
        }

        // Verificar disponibilidad del veterinario
        const [conflicto] = await pool.query(
            'SELECT id FROM citas WHERE veterinario_id = ? AND fecha_cita = ? AND estado IN ("reserva", "atendida")',
            [veterinario_id, fecha_cita]
        );

        if (conflicto.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Este horario ya no está disponible. Por favor elija otro.'
            });
        }

        // Buscar o crear mascota
        let mascota_id;
        const [mascotaExistente] = await pool.query(
            'SELECT id FROM mascotas WHERE cliente_id = ? AND nombre = ? AND especie = ?',
            [cliente_id, nombre_mascota, especie]
        );

        if (mascotaExistente.length > 0) {
            mascota_id = mascotaExistente[0].id;
            console.log('✓ Mascota existente encontrada:', mascota_id);
        } else {
            // Crear nueva mascota
            const [resultMascota] = await pool.query(
                'INSERT INTO mascotas (cliente_id, nombre, especie, sexo, estado) VALUES (?, ?, ?, ?, ?)',
                [cliente_id, nombre_mascota, especie, 'macho', 'activo']
            );
            mascota_id = resultMascota.insertId;
            console.log('✓ Nueva mascota creada:', mascota_id);
        }

        // Crear la cita con estado 'reserva'
        const [resultCita] = await pool.query(
            'INSERT INTO citas (mascota_id, veterinario_id, fecha_cita, motivo, tipo, estado) VALUES (?, ?, ?, ?, ?, ?)',
            [mascota_id, veterinario_id, fecha_cita, motivo, tipo, 'reserva']
        );

        console.log('✅ Cita reservada exitosamente:', resultCita.insertId);

        res.status(201).json({
            success: true,
            message: 'Cita reservada exitosamente. Espere la aprobación del administrador.',
            data: {
                cita_id: resultCita.insertId,
                mascota_id: mascota_id
            }
        });
    } catch (error) {
        console.error('❌ Error al reservar cita:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Aprobar cita (cambiar a estado citada)
app.put('/api/citas/:id/aprobar', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE citas SET estado = "citada" WHERE id = ? AND estado = "reserva"',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada o ya fue procesada'
            });
        }

        res.json({ success: true, message: 'Cita aprobada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Cancelar cita
app.put('/api/citas/:id/cancelar', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE citas SET estado = "cancelada" WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.json({ success: true, message: 'Cita cancelada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Crear nueva cita
app.post('/api/citas', async (req, res) => {
    try {
        const { mascota_id, veterinario_id, fecha_cita, motivo, tipo, observaciones, costo, estado } = req.body;

        console.log('Datos recibidos:', req.body);

        // Validar campos requeridos
        if (!mascota_id || !veterinario_id || !fecha_cita || !motivo || !tipo) {
            console.log('Faltan campos requeridos');
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Validar horario de atención (8am a 8pm)
        const hora = parseInt(fecha_cita.split(' ')[1].split(':')[0]);

        if (hora < 8 || hora >= 20) {
            return res.status(400).json({
                success: false,
                message: 'El horario de atención es de 8:00 AM a 8:00 PM. Por favor, seleccione otra hora.'
            });
        }

        // Verificar que la mascota existe
        const [mascota] = await pool.query('SELECT id FROM mascotas WHERE id = ? AND estado = "activo"', [mascota_id]);
        if (mascota.length === 0) {
            console.log('Mascota no encontrada:', mascota_id);
            return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
        }

        // Verificar que el veterinario existe
        const [veterinario] = await pool.query('SELECT id FROM trabajadores WHERE id = ? AND cargo = "veterinario" AND estado = "activo"', [veterinario_id]);
        if (veterinario.length === 0) {
            console.log('Veterinario no encontrado:', veterinario_id);
            return res.status(404).json({ success: false, message: 'Veterinario no encontrado' });
        }

        // Verificar disponibilidad (no hay otra cita a la misma hora con el mismo veterinario)
        const [conflicto] = await pool.query(
            'SELECT id FROM citas WHERE veterinario_id = ? AND fecha_cita = ? AND estado NOT IN ("cancelada", "atendida")',
            [veterinario_id, fecha_cita]
        );
        if (conflicto.length > 0) {
            console.log('El veterinario ya tiene una cita en ese horario');
            return res.status(400).json({ success: false, message: 'El veterinario ya tiene una cita programada en ese horario' });
        }

        const estadoCita = estado || 'reserva';

        const [result] = await pool.query(
            'INSERT INTO citas (mascota_id, veterinario_id, fecha_cita, motivo, tipo, estado, observaciones, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [mascota_id, veterinario_id, fecha_cita, motivo, tipo, estadoCita, observaciones, costo]
        );

        console.log('✅ Cita creada:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Cita registrada exitosamente',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error al crear cita:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar cita
app.put('/api/citas/:id', async (req, res) => {
    try {
        const { fecha_cita, motivo, tipo, estado, observaciones, costo } = req.body;

        // Validar horario de atención si se está actualizando la fecha
        if (fecha_cita) {
            const hora = parseInt(fecha_cita.split(' ')[1].split(':')[0]);

            if (hora < 8 || hora >= 20) {
                return res.status(400).json({
                    success: false,
                    message: 'El horario de atención es de 8:00 AM a 8:00 PM. Por favor, seleccione otra hora.'
                });
            }
        }

        const [result] = await pool.query(
            'UPDATE citas SET fecha_cita = COALESCE(?, fecha_cita), motivo = COALESCE(?, motivo), tipo = COALESCE(?, tipo), estado = COALESCE(?, estado), observaciones = ?, costo = ? WHERE id = ?',
            [fecha_cita, motivo, tipo, estado, observaciones, costo, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada' });
        }

        res.json({ success: true, message: 'Cita actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Cambiar estado de cita
app.put('/api/citas/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;

        if (!['reserva', 'atendida', 'cancelada'].includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        const [result] = await pool.query('UPDATE citas SET estado = ? WHERE id = ?', [estado, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada' });
        }

        res.json({ success: true, message: 'Estado actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Eliminar cita
app.delete('/api/citas/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM citas WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada' });
        }

        res.json({ success: true, message: 'Cita eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servicio de Citas corriendo en http://localhost:${PORT}`);
});
