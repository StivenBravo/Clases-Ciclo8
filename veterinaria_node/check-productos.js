const { pool } = require('./config/database');

async function checkProductos() {
    try {
        const [rows] = await pool.query('SELECT * FROM productos');
        console.log('📦 Total de productos:', rows.length);
        if (rows.length > 0) {
            console.log('\nProductos encontrados:');
            rows.forEach(p => {
                console.log(`- ${p.codigo}: ${p.nombre} (${p.categoria}) - Stock: ${p.stock}`);
            });
        } else {
            console.log('\n⚠️ No hay productos en la base de datos');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkProductos();
