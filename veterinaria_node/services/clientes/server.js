const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
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
        console.log('Consultando RENIEC para DNI:', dni);

        if (process.env.RENIEC_API_TOKEN && process.env.RENIEC_API_URL) {
            try {
                const url = `${process.env.RENIEC_API_URL}?numero=${dni}`;
                console.log('URL RENIEC:', url);

                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${process.env.RENIEC_API_TOKEN}`,
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });

                if (response.data) {
                    console.log('Respuesta RENIEC exitosa:', response.data);

                    // Manejar diferentes formatos de respuesta
                    const data = response.data.data || response.data;

                    return {
                        nombres: data.nombres || data.first_name || data.nombre,
                        apellidoPaterno: data.apellidoPaterno || data.apellido_paterno || data.first_last_name || data.paterno,
                        apellidoMaterno: data.apellidoMaterno || data.apellido_materno || data.second_last_name || data.materno
                    };
                }
            } catch (err) {
                console.error('Error con API RENIEC:', err.response?.data || err.message);
                console.error('Status:', err.response?.status);
            }
        } else {
            console.log('Token o URL de RENIEC no configurado');
        }

        return null;
    } catch (error) {
        console.error('Error consultando RENIEC:', error.message);
        return null;
    }
}

// GET - Listar todos los clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY fecha_registro DESC');
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

// GET - Consultar RENIEC por DNI
app.get('/api/clientes/reniec/:dni', async (req, res) => {
    try {
        const dni = req.params.dni;

        if (!dni || dni.length !== 8) {
            return res.status(400).json({ success: false, message: 'DNI debe tener 8 dígitos' });
        }

        const datosReniec = await consultarReniec(dni);

        if (datosReniec && datosReniec.nombres) {
            res.json({
                success: true,
                data: datosReniec
            });
        } else {
            res.json({
                success: false,
                message: 'No se pudo consultar el DNI'
            });
        }
    } catch (error) {
        console.error('Error en consulta RENIEC:', error);
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

        if (datosReniec && datosReniec.nombres) {
            // Manejar diferentes estructuras de respuesta de la API
            res.json({
                success: true,
                data: {
                    dni: dni,
                    nombres: datosReniec.nombres,
                    apellidoPaterno: datosReniec.apellidoPaterno || datosReniec.apellido_paterno,
                    apellidoMaterno: datosReniec.apellidoMaterno || datosReniec.apellido_materno
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No se pudo validar el DNI. Ingrese datos manualmente.'
            });
        }
    } catch (error) {
        console.error('Error en validar-dni:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Registrar nuevo cliente desde formulario público (sin autenticación)
app.post('/api/clientes/register', async (req, res) => {
    try {
        console.log('📝 Solicitud de registro recibida');
        console.log('Datos:', req.body);

        const { dni, nombres, apellidoPaterno, apellidoMaterno, telefono, correo, direccion, password } = req.body;

        // Validar campos requeridos
        if (!dni || !nombres || !apellidoPaterno || !apellidoMaterno || !telefono || !correo || !direccion || !password) {
            console.log('❌ Faltan campos requeridos');
            return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
        }

        console.log('✓ Campos validados');

        // Validar longitud de contraseña
        if (password.length < 6) {
            console.log('❌ Contraseña muy corta');
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        console.log('✓ Contraseña válida');

        // Verificar si el DNI ya existe
        const [existing] = await pool.query('SELECT id FROM clientes WHERE dni = ?', [dni]);
        if (existing.length > 0) {
            console.log('❌ DNI ya registrado');
            return res.status(400).json({ success: false, message: 'El DNI ya está registrado' });
        }

        console.log('✓ DNI disponible');

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✓ Contraseña encriptada');

        // Crear username automáticamente (DNI)
        const username = dni;
        const nombreCompleto = `${nombres} ${apellidoPaterno} ${apellidoMaterno}`;

        // Insertar en tabla usuarios
        console.log('📤 Insertando usuario...');
        const [userResult] = await pool.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, nombreCompleto, 'cliente']
        );
        console.log('✓ Usuario creado con ID:', userResult.insertId);

        // Insertar el nuevo cliente vinculado al usuario CON DIRECCIÓN
        console.log('📤 Insertando cliente...');
        const [result] = await pool.query(
            'INSERT INTO clientes (dni, nombres, apellido_paterno, apellido_materno, telefono, email, direccion, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [dni, nombres, apellidoPaterno, apellidoMaterno, telefono, correo, direccion, userResult.insertId]
        );
        console.log('✓ Cliente creado con ID:', result.insertId);

        console.log('✅ Registro completado exitosamente');

        res.status(201).json({
            success: true,
            message: 'Registro completado exitosamente. Usa tu DNI como usuario para iniciar sesión.',
            data: { id: result.insertId, dni, username }
        });
    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Registrar nuevo cliente (desde panel admin)
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

// PUT - Aprobar registro de cliente
app.put('/api/clientes/:id/aprobar', async (req, res) => {
    try {
        const [result] = await pool.query('UPDATE clientes SET estado = "activo" WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        res.json({ success: true, message: 'Cliente aprobado exitosamente' });
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
    console.log(`Servicio de Clientes corriendo en http://localhost:${PORT}`);
});