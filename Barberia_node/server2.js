const http = require('http');
const mysql = require('mysql2');

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'barberia_db'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        process.exit(1);
    }
    console.log('✓ Servidor 2 conectado a MySQL');
});

const server = http.createServer((req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /citas - Obtener todas las citas con detalles
    if (req.url === '/citas' && req.method === 'GET') {
        const query = `
            SELECT 
                c.id,
                c.cliente_nombre,
                c.cliente_telefono,
                c.cliente_email,
                c.fecha_cita,
                c.estado,
                c.comentarios,
                c.fecha_creacion,
                s.nombre as servicio_nombre,
                s.precio as servicio_precio,
                s.duracion as servicio_duracion,
                b.nombre as barbero_nombre,
                b.especialidad as barbero_especialidad
            FROM citas c
            JOIN servicios s ON c.servicio_id = s.id
            JOIN barberos b ON c.barbero_id = b.id
            ORDER BY c.fecha_cita DESC
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener citas:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener citas' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    // POST /citas - Crear una nueva cita
    else if (req.url === '/citas' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const nuevaCita = JSON.parse(body);
                const { cliente_nombre, cliente_telefono, cliente_email, servicio_id, barbero_id, fecha_cita, comentarios } = nuevaCita;

                // Validación
                if (!cliente_nombre || !cliente_telefono || !servicio_id || !barbero_id || !fecha_cita) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Faltan datos requeridos' }));
                    return;
                }

                const query = `
                    INSERT INTO citas (cliente_nombre, cliente_telefono, cliente_email, servicio_id, barbero_id, fecha_cita, comentarios)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(query, [cliente_nombre, cliente_telefono, cliente_email || null, servicio_id, barbero_id, fecha_cita, comentarios || null],
                    (err, result) => {
                        if (err) {
                            console.error('Error al crear cita:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Error al crear la cita' }));
                            return;
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            mensaje: 'Cita creada exitosamente',
                            id: result.insertId
                        }));
                    }
                );
            } catch (error) {
                console.error('Error al procesar cita:', error);
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

server.listen(3002, () => {
    console.log(' Servidor 2 (CITAS) corriendo en http://localhost:3002');
    console.log('   GET  /citas  - Lista todas las citas con detalles');
    console.log('   POST /citas  - Crea una nueva cita');
});
