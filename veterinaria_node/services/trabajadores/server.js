const express = require('express');
const cors = require('cors');
const { pool } = require('../../config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_TRABAJADORES || 3005;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Trabajadores', timestamp: new Date().toISOString() });
});

// ============ ENDPOINTS DE TRABAJADORES ============

// GET - Listar todos los trabajadores
app.get('/api/trabajadores', async (req, res) => {
    try {
        const { cargo, estado } = req.query;
        let query = 'SELECT * FROM trabajadores WHERE 1=1';
        const params = [];

        if (cargo) {
            query += ' AND cargo = ?';
            params.push(cargo);
        }
        if (estado) {
            query += ' AND estado = ?';
            params.push(estado);
        } else {
            query += ' AND estado = "activo"';
        }

        query += ' ORDER BY nombres ASC';

        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Obtener trabajador por ID
app.get('/api/trabajadores/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM trabajadores WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Listar veterinarios activos
app.get('/api/trabajadores/veterinarios/activos', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, nombres, apellidos, especialidad FROM trabajadores WHERE cargo = "veterinario" AND estado = "activo" ORDER BY nombres'
        );
        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Registrar nuevo trabajador
app.post('/api/trabajadores', async (req, res) => {
    try {
        const { dni, nombres, apellidos, cargo, especialidad, telefono, email, fecha_contratacion, salario } = req.body;

        // Validar campos requeridos
        if (!dni || !nombres || !apellidos || !cargo || !fecha_contratacion) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Verificar si el DNI ya existe
        const [existing] = await pool.query('SELECT id FROM trabajadores WHERE dni = ?', [dni]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'El DNI ya está registrado' });
        }

        const [result] = await pool.query(
            'INSERT INTO trabajadores (dni, nombres, apellidos, cargo, especialidad, telefono, email, fecha_contratacion, salario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [dni, nombres, apellidos, cargo, especialidad, telefono, email, fecha_contratacion, salario]
        );

        res.status(201).json({
            success: true,
            message: 'Trabajador registrado exitosamente',
            data: { id: result.insertId, dni, nombres, apellidos }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar trabajador
app.put('/api/trabajadores/:id', async (req, res) => {
    try {
        const { nombres, apellidos, cargo, especialidad, telefono, email, salario, estado } = req.body;

        const [result] = await pool.query(
            'UPDATE trabajadores SET nombres = ?, apellidos = ?, cargo = ?, especialidad = ?, telefono = ?, email = ?, salario = ?, estado = ? WHERE id = ?',
            [nombres, apellidos, cargo, especialidad, telefono, email, salario, estado, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
        }

        res.json({ success: true, message: 'Trabajador actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Eliminar trabajador (soft delete)
app.delete('/api/trabajadores/:id', async (req, res) => {
    try {
        const [result] = await pool.query('UPDATE trabajadores SET estado = "inactivo" WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
        }

        res.json({ success: true, message: 'Trabajador eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ ENDPOINTS DE TRATAMIENTOS ============

// GET - Listar todos los tratamientos
app.get('/api/tratamientos', async (req, res) => {
    try {
        const { mascota_id, estado, tipo } = req.query;
        let query = `
            SELECT t.*, 
                   m.nombre as mascota_nombre, m.especie,
                   cl.nombres, cl.apellido_paterno, cl.apellido_materno,
                   v.nombres as vet_nombres, v.apellidos as vet_apellidos
            FROM tratamientos t
            INNER JOIN mascotas m ON t.mascota_id = m.id
            INNER JOIN clientes cl ON m.cliente_id = cl.id
            INNER JOIN trabajadores v ON t.veterinario_id = v.id
            WHERE 1=1
        `;
        const params = [];

        if (mascota_id) {
            query += ' AND t.mascota_id = ?';
            params.push(mascota_id);
        }
        if (estado) {
            query += ' AND t.estado = ?';
            params.push(estado);
        }
        if (tipo) {
            query += ' AND t.tipo = ?';
            params.push(tipo);
        }

        query += ' ORDER BY t.fecha_registro DESC';

        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Obtener tratamiento por ID
app.get('/api/tratamientos/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, 
                   m.nombre as mascota_nombre, m.especie, m.raza,
                   cl.nombres, cl.apellido_paterno, cl.apellido_materno, cl.telefono,
                   v.nombres as vet_nombres, v.apellidos as vet_apellidos, v.especialidad,
                   c.fecha_cita, c.tipo as tipo_cita
            FROM tratamientos t
            INNER JOIN mascotas m ON t.mascota_id = m.id
            INNER JOIN clientes cl ON m.cliente_id = cl.id
            INNER JOIN trabajadores v ON t.veterinario_id = v.id
            LEFT JOIN citas c ON t.cita_id = c.id
            WHERE t.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tratamiento no encontrado' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Tratamientos de una mascota
app.get('/api/tratamientos/mascota/:mascotaId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, v.nombres as vet_nombres, v.apellidos as vet_apellidos
            FROM tratamientos t
            INNER JOIN trabajadores v ON t.veterinario_id = v.id
            WHERE t.mascota_id = ?
            ORDER BY t.fecha_inicio DESC
        `, [req.params.mascotaId]);

        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Registrar nuevo tratamiento
app.post('/api/tratamientos', async (req, res) => {
    try {
        const { mascota_id, veterinario_id, tipo, enfermedad, vacuna, descripcion, fecha_inicio, fecha_proxima_visita, costo } = req.body;

        // Validar campos requeridos
        if (!mascota_id || !veterinario_id || !tipo || !fecha_inicio) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        if (tipo === 'enfermedad' && !enfermedad) {
            return res.status(400).json({ success: false, message: 'Debe especificar la enfermedad' });
        }

        if (tipo === 'vacuna' && !vacuna) {
            return res.status(400).json({ success: false, message: 'Debe especificar la vacuna' });
        }

        const [result] = await pool.query(
            'INSERT INTO tratamientos (mascota_id, veterinario_id, tipo, enfermedad, vacuna, descripcion, fecha_inicio, fecha_proxima_visita, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [mascota_id, veterinario_id, tipo, enfermedad, vacuna, descripcion, fecha_inicio, fecha_proxima_visita, costo]
        );

        res.status(201).json({
            success: true,
            message: 'Tratamiento registrado exitosamente',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar tratamiento
app.put('/api/tratamientos/:id', async (req, res) => {
    try {
        const { tipo, enfermedad, vacuna, descripcion, fecha_proxima_visita, costo, estado } = req.body;

        const [result] = await pool.query(
            'UPDATE tratamientos SET tipo = COALESCE(?, tipo), enfermedad = ?, vacuna = ?, descripcion = ?, fecha_proxima_visita = ?, costo = ?, estado = COALESCE(?, estado) WHERE id = ?',
            [tipo, enfermedad, vacuna, descripcion, fecha_proxima_visita, costo, estado, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Tratamiento no encontrado' });
        }

        res.json({ success: true, message: 'Tratamiento actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Eliminar tratamiento
app.delete('/api/tratamientos/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM tratamientos WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Tratamiento no encontrado' });
        }

        res.json({ success: true, message: 'Tratamiento eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servicio de Trabajadores y Tratamientos corriendo en http://localhost:${PORT}`);
});
