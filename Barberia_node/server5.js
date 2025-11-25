// SERVIDOR 5 - HORARIOS DISPONIBLES (Puerto 3005)
// Gestiona horarios disponibles para reservas
const http = require('http');
const mysql = require('mysql2');

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Cambia según tu configuración
    database: 'barberia_db'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err);
        process.exit(1);
    }
    console.log('✓ Servidor 5 conectado a MySQL');
});

const server = http.createServer((req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /horarios - Obtener todos los horarios
    if (req.url === '/horarios' && req.method === 'GET') {
        const query = `
            SELECT h.*, b.nombre as barbero_nombre, b.especialidad
            FROM horarios h
            JOIN barberos b ON h.barbero_id = b.id
            WHERE h.fecha >= CURDATE()
            ORDER BY h.fecha, h.hora_inicio
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener horarios:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener horarios' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    // GET /horarios/disponibles - Solo horarios disponibles
    else if (req.url === '/horarios/disponibles' && req.method === 'GET') {
        const query = `
            SELECT h.*, b.nombre as barbero_nombre, b.especialidad
            FROM horarios h
            JOIN barberos b ON h.barbero_id = b.id
            WHERE h.disponible = TRUE AND h.fecha >= CURDATE()
            ORDER BY h.fecha, h.hora_inicio
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener horarios disponibles:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener horarios' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    // GET /horarios/barbero/:id - Horarios de un barbero específico
    else if (req.url.match(/^\/horarios\/barbero\/\d+$/) && req.method === 'GET') {
        const barbero_id = req.url.split('/')[3];
        const query = `
            SELECT h.*, b.nombre as barbero_nombre, b.especialidad
            FROM horarios h
            JOIN barberos b ON h.barbero_id = b.id
            WHERE h.barbero_id = ? AND h.fecha >= CURDATE()
            ORDER BY h.fecha, h.hora_inicio
        `;

        db.query(query, [barbero_id], (err, results) => {
            if (err) {
                console.error('Error al obtener horarios del barbero:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener horarios' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    // POST /horarios - Crear nuevo horario
    else if (req.url === '/horarios' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const nuevoHorario = JSON.parse(body);
                const { barbero_id, fecha, hora_inicio, hora_fin, disponible } = nuevoHorario;

                // Validación
                if (!barbero_id || !fecha || !hora_inicio || !hora_fin) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Faltan datos requeridos' }));
                    return;
                }

                const query = 'INSERT INTO horarios (barbero_id, fecha, hora_inicio, hora_fin, disponible) VALUES (?, ?, ?, ?, ?)';
                db.query(query, [barbero_id, fecha, hora_inicio, hora_fin, disponible !== false], (err, result) => {
                    if (err) {
                        console.error('Error al crear horario:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error al crear el horario' }));
                        return;
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        mensaje: 'Horario creado exitosamente',
                        id: result.insertId
                    }));
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Datos inválidos' }));
            }
        });
    }
    // PUT /horarios/:id/disponibilidad - Cambiar disponibilidad
    else if (req.url.match(/^\/horarios\/\d+\/disponibilidad$/) && req.method === 'PUT') {
        const id = req.url.split('/')[2];
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { disponible } = JSON.parse(body);
                const query = 'UPDATE horarios SET disponible = ? WHERE id = ?';

                db.query(query, [disponible, id], (err, result) => {
                    if (err) {
                        console.error('Error al actualizar disponibilidad:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error al actualizar disponibilidad' }));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Horario no encontrado' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ mensaje: 'Disponibilidad actualizada exitosamente' }));
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Datos inválidos' }));
            }
        });
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3005, () => {
    console.log('🔶 Servidor 5 (HORARIOS) corriendo en http://localhost:3005');
    console.log('   GET  /horarios                     - Lista todos los horarios');
    console.log('   GET  /horarios/disponibles         - Solo horarios disponibles');
    console.log('   GET  /horarios/barbero/:id         - Horarios de un barbero');
    console.log('   POST /horarios                     - Crea un nuevo horario');
    console.log('   PUT  /horarios/:id/disponibilidad  - Cambia disponibilidad');
});
