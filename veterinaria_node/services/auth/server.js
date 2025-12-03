const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { pool } = require('../../config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_AUTH || 3006;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Auth', timestamp: new Date().toISOString() });
});

// POST - Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
        }

        // Buscar usuario
        const [users] = await pool.query(
            'SELECT * FROM usuarios WHERE username = ? AND estado = "activo"',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Actualizar último acceso
        await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [user.id]);

        // Devolver datos del usuario (sin password)
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                id: user.id,
                username: user.username,
                nombre_completo: user.nombre_completo,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// POST - Crear usuario (solo para admin)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, nombre_completo, rol } = req.body;

        if (!username || !password || !nombre_completo) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Verificar si el usuario ya existe
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const [result] = await pool.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, nombre_completo, rol || 'recepcionista']
        );

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: { id: result.insertId, username }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Obtener usuarios (solo para admin)
app.get('/api/auth/users', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, nombre_completo, rol, estado, fecha_creacion, ultimo_acceso FROM usuarios ORDER BY fecha_creacion DESC'
        );
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Cambiar contraseña
app.put('/api/auth/change-password', async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Verificar contraseña actual
        const [users] = await pool.query('SELECT password FROM usuarios WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(oldPassword, users[0].password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servicio de Autenticación corriendo en http://localhost:${PORT}`);
});
