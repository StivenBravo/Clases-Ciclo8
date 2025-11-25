// SERVIDOR 1 - SERVICIOS DE BARBERÍA (Puerto 3001)
// Equivalente a server1.js (platos) pero para servicios de barbería
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
    console.log('✓ Servidor 1 conectado a MySQL');
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

    // GET /servicios - Obtener todos los servicios
    if (req.url === '/servicios' && req.method === 'GET') {
        const query = 'SELECT * FROM servicios ORDER BY precio ASC';

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener servicios:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener servicios' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    // POST /servicios - Agregar un nuevo servicio
    else if (req.url === '/servicios' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const nuevoServicio = JSON.parse(body);
                const { nombre, descripcion, precio, duracion } = nuevoServicio;

                // Validación
                if (!nombre || !precio || !duracion) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Faltan datos requeridos (nombre, precio, duracion)' }));
                    return;
                }

                const query = 'INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES (?, ?, ?, ?)';
                db.query(query, [nombre, descripcion || '', precio, duracion], (err, result) => {
                    if (err) {
                        console.error('Error al insertar servicio:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error al crear el servicio' }));
                        return;
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        mensaje: 'Servicio creado exitosamente',
                        id: result.insertId,
                        ...nuevoServicio
                    }));
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

server.listen(3001, () => {
    console.log('🔷 Servidor 1 (SERVICIOS) corriendo en http://localhost:3001');
    console.log('   GET  /servicios  - Lista todos los servicios');
    console.log('   POST /servicios  - Agrega un nuevo servicio');
});
