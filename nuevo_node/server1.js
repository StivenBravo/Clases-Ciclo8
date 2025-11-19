const http = require('http');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'server1.json');

const server = http.createServer((req, res) => {
    // Habilitar CORS para permitir peticiones desde el navegador
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/platos' && req.method === 'GET') {
        fs.createReadStream(dbPath).pipe(res);
    } else if (req.url === '/platos' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const platos = JSON.parse(fs.readFileSync(dbPath));
                const nuevoPlato = JSON.parse(body);
                // Podrías añadir validación aquí: if (!nuevoPlato.nombre || !nuevoPlato.precio) ...
                platos.push(nuevoPlato);
                fs.writeFileSync(dbPath, JSON.stringify(platos, null, 4));
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(nuevoPlato));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Datos inválidos' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3001, () => console.log('Server 1 (Comidas) corriendo en http://localhost:3001'));