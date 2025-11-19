const http = require('http');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'server3.json');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/productos' && req.method === 'GET') {
        fs.createReadStream(dbPath).pipe(res);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3003, () => console.log('Server 3 (Comics y Revistas) corriendo en http://localhost:3003'));
