// Servidor Node.js para la Barbería
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Cambia esto según tu configuración
    database: 'barberia_db'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('✓ Conectado a la base de datos MySQL');
});

// ============== ENDPOINTS DE SERVICIOS ==============

// Obtener todos los servicios
app.get('/api/servicios', (req, res) => {
    const query = 'SELECT * FROM servicios ORDER BY precio ASC';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener servicios' });
            return;
        }
        res.json(results);
    });
});

// Obtener un servicio por ID
app.get('/api/servicios/:id', (req, res) => {
    const query = 'SELECT * FROM servicios WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener el servicio' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Servicio no encontrado' });
            return;
        }
        res.json(results[0]);
    });
});

// ============== ENDPOINTS DE BARBEROS ==============

// Obtener todos los barberos activos
app.get('/api/barberos', (req, res) => {
    const query = 'SELECT * FROM barberos WHERE activo = TRUE ORDER BY nombre ASC';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener barberos' });
            return;
        }
        res.json(results);
    });
});

// Obtener un barbero por ID
app.get('/api/barberos/:id', (req, res) => {
    const query = 'SELECT * FROM barberos WHERE id = ? AND activo = TRUE';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener el barbero' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Barbero no encontrado' });
            return;
        }
        res.json(results[0]);
    });
});

// ============== ENDPOINTS DE CITAS ==============

// Obtener todas las citas
app.get('/api/citas', (req, res) => {
    const query = `
        SELECT c.*, s.nombre as servicio_nombre, s.precio, b.nombre as barbero_nombre
        FROM citas c
        JOIN servicios s ON c.servicio_id = s.id
        JOIN barberos b ON c.barbero_id = b.id
        ORDER BY c.fecha_cita DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener citas' });
            return;
        }
        res.json(results);
    });
});

// Crear una nueva cita
app.post('/api/citas', (req, res) => {
    const { cliente_nombre, cliente_telefono, cliente_email, servicio_id, barbero_id, fecha_cita, comentarios } = req.body;

    // Validación básica
    if (!cliente_nombre || !cliente_telefono || !servicio_id || !barbero_id || !fecha_cita) {
        res.status(400).json({ error: 'Faltan datos requeridos' });
        return;
    }

    const query = `
        INSERT INTO citas (cliente_nombre, cliente_telefono, cliente_email, servicio_id, barbero_id, fecha_cita, comentarios)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [cliente_nombre, cliente_telefono, cliente_email, servicio_id, barbero_id, fecha_cita, comentarios], (err, result) => {
        if (err) {
            console.error('Error al crear cita:', err);
            res.status(500).json({ error: 'Error al crear la cita' });
            return;
        }
        res.status(201).json({
            mensaje: 'Cita creada exitosamente',
            id: result.insertId
        });
    });
});

// Obtener cita por ID
app.get('/api/citas/:id', (req, res) => {
    const query = `
        SELECT c.*, s.nombre as servicio_nombre, s.precio, s.duracion, b.nombre as barbero_nombre
        FROM citas c
        JOIN servicios s ON c.servicio_id = s.id
        JOIN barberos b ON c.barbero_id = b.id
        WHERE c.id = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener la cita' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Cita no encontrada' });
            return;
        }
        res.json(results[0]);
    });
});

// Actualizar estado de cita
app.put('/api/citas/:id/estado', (req, res) => {
    const { estado } = req.body;
    const query = 'UPDATE citas SET estado = ? WHERE id = ?';

    db.query(query, [estado, req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar la cita' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Cita no encontrada' });
            return;
        }
        res.json({ mensaje: 'Estado actualizado exitosamente' });
    });
});

// ============== RUTA PRINCIPAL ==============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`\nEndpoints disponibles:`);
    console.log(`  GET  /api/servicios       - Lista todos los servicios`);
    console.log(`  GET  /api/servicios/:id   - Obtiene un servicio`);
    console.log(`  GET  /api/barberos        - Lista todos los barberos`);
    console.log(`  GET  /api/barberos/:id    - Obtiene un barbero`);
    console.log(`  GET  /api/citas           - Lista todas las citas`);
    console.log(`  POST /api/citas           - Crea una nueva cita`);
    console.log(`  GET  /api/citas/:id       - Obtiene una cita`);
    console.log(`  PUT  /api/citas/:id/estado - Actualiza estado de cita`);
});
