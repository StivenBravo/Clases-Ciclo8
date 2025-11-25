// SERVIDOR 4 - PRODUCTOS (Puerto 3004)
// Gestiona productos de barbería disponibles para venta
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
    console.log('✓ Servidor 4 conectado a MySQL');
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

    // GET /productos - Obtener todos los productos
    if (req.url === '/productos' && req.method === 'GET') {
        const query = 'SELECT * FROM productos ORDER BY categoria, nombre ASC';

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener productos:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener productos' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    // GET /productos/categoria/:categoria - Filtrar por categoría
    else if (req.url.match(/^\/productos\/categoria\/[^/]+$/) && req.method === 'GET') {
        const categoria = decodeURIComponent(req.url.split('/')[3]);
        const query = 'SELECT * FROM productos WHERE categoria = ? ORDER BY nombre ASC';

        db.query(query, [categoria], (err, results) => {
            if (err) {
                console.error('Error al filtrar productos:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al filtrar productos' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    // POST /productos - Agregar un nuevo producto
    else if (req.url === '/productos' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const nuevoProducto = JSON.parse(body);
                const { nombre, categoria, descripcion, precio, stock, marca } = nuevoProducto;

                // Validación
                if (!nombre || !categoria || !precio) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Faltan datos requeridos (nombre, categoria, precio)' }));
                    return;
                }

                const query = 'INSERT INTO productos (nombre, categoria, descripcion, precio, stock, marca) VALUES (?, ?, ?, ?, ?, ?)';
                db.query(query, [nombre, categoria, descripcion || '', precio, stock || 0, marca || ''], (err, result) => {
                    if (err) {
                        console.error('Error al insertar producto:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error al crear el producto' }));
                        return;
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        mensaje: 'Producto creado exitosamente',
                        id: result.insertId,
                        ...nuevoProducto
                    }));
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Datos inválidos' }));
            }
        });
    }
    // PUT /productos/:id/stock - Actualizar stock
    else if (req.url.match(/^\/productos\/\d+\/stock$/) && req.method === 'PUT') {
        const id = req.url.split('/')[2];
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { stock } = JSON.parse(body);
                const query = 'UPDATE productos SET stock = ? WHERE id = ?';

                db.query(query, [stock, id], (err, result) => {
                    if (err) {
                        console.error('Error al actualizar stock:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error al actualizar stock' }));
                        return;
                    }
                    if (result.affectedRows === 0) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Producto no encontrado' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ mensaje: 'Stock actualizado exitosamente' }));
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

server.listen(3004, () => {
    console.log('🔷 Servidor 4 (PRODUCTOS) corriendo en http://localhost:3004');
    console.log('   GET  /productos                    - Lista todos los productos');
    console.log('   GET  /productos/categoria/:cat     - Filtra por categoría');
    console.log('   POST /productos                    - Agrega un nuevo producto');
    console.log('   PUT  /productos/:id/stock          - Actualiza stock');
});
