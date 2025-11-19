const http = require('http');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'server2.json');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/facturas' && req.method === 'GET') {
        fs.readFile(dbPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error al leer server2.json:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error interno del servidor al leer las facturas.' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (req.url === '/facturas' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const facturas = JSON.parse(fs.readFileSync(dbPath));
                const nuevaFactura = JSON.parse(body);
                facturas.push(nuevaFactura);
                fs.writeFileSync(dbPath, JSON.stringify(facturas, null, 4));
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(nuevaFactura));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Datos inválidos al guardar factura' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3002, () => console.log('Server 2 (Facturas) corriendo en http://localhost:3002'));