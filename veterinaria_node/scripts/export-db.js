const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'veterinaria_db'
};

const outputFile = path.join(__dirname, 'backup-veterinaria.sql');

console.log('Exportando base de datos...');
console.log(`Base de datos: ${dbConfig.database}`);
console.log(`Archivo: ${outputFile}\n`);

// Comando mysqldump
const command = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ''} ${dbConfig.database} > "${outputFile}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Error al exportar:', error.message);
        console.log('\n💡 Si no tienes mysqldump en PATH, usa este comando manualmente:');
        console.log(`mysqldump -h ${dbConfig.host} -u ${dbConfig.user} -p ${dbConfig.database} > backup-veterinaria.sql`);
        process.exit(1);
    }

    if (stderr) {
        console.log(stderr);
    }

    console.log('✅ Base de datos exportada exitosamente!');
    console.log(`📁 Archivo: ${outputFile}`);
    console.log('\n📋 Para importar en otra máquina:');
    console.log('1. Copia el archivo backup-veterinaria.sql');
    console.log('2. Ejecuta: mysql -u root -p < backup-veterinaria.sql');
    console.log('3. O usa: node import-db.js');
});
