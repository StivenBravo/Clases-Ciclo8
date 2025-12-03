const express = require('express');
const cors = require('cors');
const { pool } = require('../../config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_MASCOTAS || 3002;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Mascotas', timestamp: new Date().toISOString() });
});

// GET - Listar todas las mascotas
app.get('/api/mascotas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, c.nombres, c.apellido_paterno, c.apellido_materno, c.telefono
            FROM mascotas m
            INNER JOIN clientes c ON m.cliente_id = c.id
            WHERE m.estado != 'inactivo'
            ORDER BY m.fecha_registro DESC
        `);
        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Obtener mascota por ID
app.get('/api/mascotas/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, c.nombres, c.apellido_paterno, c.apellido_materno, c.telefono, c.email
            FROM mascotas m
            INNER JOIN clientes c ON m.cliente_id = c.id
            WHERE m.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Obtener mascotas de un cliente
app.get('/api/mascotas/cliente/:clienteId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM mascotas WHERE cliente_id = ? AND estado != "inactivo" ORDER BY nombre',
            [req.params.clienteId]
        );
        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Registrar nueva mascota
app.post('/api/mascotas', async (req, res) => {
    try {
        const { cliente_id, nombre, especie, raza, fecha_nacimiento, sexo, color, peso, observaciones } = req.body;

        // Validar campos requeridos
        if (!cliente_id || !nombre || !especie || !sexo) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Verificar que el cliente existe
        const [cliente] = await pool.query('SELECT id FROM clientes WHERE id = ? AND estado = "activo"', [cliente_id]);
        if (cliente.length === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado o inactivo' });
        }

        const [result] = await pool.query(
            'INSERT INTO mascotas (cliente_id, nombre, especie, raza, fecha_nacimiento, sexo, color, peso, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [cliente_id, nombre, especie, raza, fecha_nacimiento, sexo, color, peso, observaciones]
        );

        res.status(201).json({
            success: true,
            message: 'Mascota registrada exitosamente',
            data: { id: result.insertId, nombre }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar mascota
app.put('/api/mascotas/:id', async (req, res) => {
    try {
        const { nombre, especie, raza, fecha_nacimiento, sexo, color, peso, observaciones, estado } = req.body;

        const [result] = await pool.query(
            'UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, fecha_nacimiento = ?, sexo = ?, color = ?, peso = ?, observaciones = ?, estado = COALESCE(?, estado) WHERE id = ?',
            [nombre, especie, raza, fecha_nacimiento, sexo, color, peso, observaciones, estado, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
        }

        res.json({ success: true, message: 'Mascota actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar mascota:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Eliminar mascota (soft delete)
app.delete('/api/mascotas/:id', async (req, res) => {
    try {
        const [result] = await pool.query('UPDATE mascotas SET estado = "inactivo" WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
        }

        res.json({ success: true, message: 'Mascota eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Estadísticas de mascotas
app.get('/api/mascotas/stats/general', async (req, res) => {
    try {
        const [especies] = await pool.query(`
            SELECT especie, COUNT(*) as cantidad 
            FROM mascotas 
            WHERE estado = 'activo' 
            GROUP BY especie
        `);

        const [total] = await pool.query('SELECT COUNT(*) as total FROM mascotas WHERE estado = "activo"');

        res.json({
            success: true,
            data: {
                total: total[0].total,
                por_especie: especies
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servicio de Mascotas corriendo en http://localhost:${PORT}`);
});
