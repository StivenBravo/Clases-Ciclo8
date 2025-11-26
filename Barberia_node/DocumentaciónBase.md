### Funcionamiento:
```javascript
// server1.js - Lee de MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'barberia_db'
});

db.query('SELECT * FROM servicios', (err, results) => {
    res.end(JSON.stringify(results));
});
```
### MYSQL VS JSON
se usa el db en vez del write de lectura de datos 