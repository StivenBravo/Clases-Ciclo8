// SERVIDOR 3 - BARBEROS (Puerto 3003)
// Equivalente a server3.js (tragos) pero para barberos
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
    console.log('✓ Servidor 3 conectado a MySQL');
});

const server = http.createServer((req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /barberos - Obtener todos los barberos activos
    if (req.url === '/barberos' && req.method === 'GET') {
        const query = 'SELECT * FROM barberos WHERE activo = TRUE ORDER BY nombre ASC';

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener barberos:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener barberos' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3003, () => {
    console.log('🔷 Servidor 3 (BARBEROS) corriendo en http://localhost:3003');
    console.log('   GET  /barberos  - Lista todos los barberos activos');
});
