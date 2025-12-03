const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { pool } = require('../../config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_CLIENTES || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Clientes', timestamp: new Date().toISOString() });
});

// Función para consultar API de RENIEC
async function consultarReniec(dni) {
    try {
        const response = await axios.get(`${process.env.RENIEC_API_URL}?numero=${dni}`, {
            headers: {
                'Authorization': `Bearer ${process.env.RENIEC_API_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.log('⚠️ API RENIEC no disponible, continuando sin validación');
        return null;
    }
}

// GET - Listar todos los clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE estado = "activo" ORDER BY fecha_registro DESC');
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Obtener cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Buscar cliente por DNI
app.get('/api/clientes/dni/:dni', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE dni = ?', [req.params.dni]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Validar DNI con RENIEC
app.post('/api/clientes/validar-dni', async (req, res) => {
    try {
        const { dni } = req.body;

        if (!dni || dni.length !== 8) {
            return res.status(400).json({ success: false, message: 'DNI debe tener 8 dígitos' });
        }

        const datosReniec = await consultarReniec(dni);

        if (datosReniec) {
            res.json({
                success: true,
                data: {
                    dni: dni,
                    nombres: datosReniec.nombres,
                    apellido_paterno: datosReniec.apellidoPaterno,
                    apellido_materno: datosReniec.apellidoMaterno
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No se pudo validar el DNI. Ingrese datos manualmente.'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Registrar nuevo cliente
app.post('/api/clientes', async (req, res) => {
    try {
        const { dni, nombres, apellido_paterno, apellido_materno, telefono, email, direccion } = req.body;

        // Validar campos requeridos
        if (!dni || !nombres || !apellido_paterno || !apellido_materno) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Verificar si el DNI ya existe
        const [existing] = await pool.query('SELECT id FROM clientes WHERE dni = ?', [dni]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'El DNI ya está registrado' });
        }

        const [result] = await pool.query(
            'INSERT INTO clientes (dni, nombres, apellido_paterno, apellido_materno, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [dni, nombres, apellido_paterno, apellido_materno, telefono, email, direccion]
        );

        res.status(201).json({
            success: true,
            message: 'Cliente registrado exitosamente',
            data: { id: result.insertId, dni }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar cliente
app.put('/api/clientes/:id', async (req, res) => {
    try {
        const { nombres, apellido_paterno, apellido_materno, telefono, email, direccion } = req.body;

        const [result] = await pool.query(
            'UPDATE clientes SET nombres = ?, apellido_paterno = ?, apellido_materno = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?',
            [nombres, apellido_paterno, apellido_materno, telefono, email, direccion, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        res.json({ success: true, message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Eliminar cliente (soft delete)
app.delete('/api/clientes/:id', async (req, res) => {
    try {
        const [result] = await pool.query('UPDATE clientes SET estado = "inactivo" WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        res.json({ success: true, message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🟢 Servicio de Clientes corriendo en http://localhost:${PORT}`);
});
