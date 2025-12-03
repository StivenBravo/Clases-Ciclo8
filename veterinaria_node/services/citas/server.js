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

// GET - Obtener cita por ID
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

// GET - Citas de una mascota
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

// GET - Citas del día
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

// POST - Crear nueva cita
app.post('/api/citas', async (req, res) => {
    try {
        const { mascota_id, veterinario_id, fecha_cita, motivo, tipo, observaciones, costo } = req.body;

        // Validar campos requeridos
        if (!mascota_id || !veterinario_id || !fecha_cita || !motivo || !tipo) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Verificar que la mascota existe
        const [mascota] = await pool.query('SELECT id FROM mascotas WHERE id = ? AND estado = "activo"', [mascota_id]);
        if (mascota.length === 0) {
            return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
        }

        // Verificar que el veterinario existe
        const [veterinario] = await pool.query('SELECT id FROM trabajadores WHERE id = ? AND cargo = "veterinario" AND estado = "activo"', [veterinario_id]);
        if (veterinario.length === 0) {
            return res.status(404).json({ success: false, message: 'Veterinario no encontrado' });
        }

        // Verificar disponibilidad (no hay otra cita a la misma hora con el mismo veterinario)
        const [conflicto] = await pool.query(
            'SELECT id FROM citas WHERE veterinario_id = ? AND fecha_cita = ? AND estado NOT IN ("cancelada", "atendida")',
            [veterinario_id, fecha_cita]
        );
        if (conflicto.length > 0) {
            return res.status(400).json({ success: false, message: 'El veterinario ya tiene una cita programada en ese horario' });
        }

        const estado = req.body.estado || 'reserva';

        const [result] = await pool.query(
            'INSERT INTO citas (mascota_id, veterinario_id, fecha_cita, motivo, tipo, estado, observaciones, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [mascota_id, veterinario_id, fecha_cita, motivo, tipo, estado, observaciones, costo]
        );

        res.status(201).json({
            success: true,
            message: 'Cita registrada exitosamente',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar cita
app.put('/api/citas/:id', async (req, res) => {
    try {
        const { fecha_cita, motivo, tipo, estado, observaciones, costo } = req.body;

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
    console.log(`🟢 Servicio de Citas corriendo en http://localhost:${PORT}`);
});
