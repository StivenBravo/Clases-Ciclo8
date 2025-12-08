const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'veterinaria_db'
};

const inputFile = path.join(__dirname, 'backup-veterinaria.sql');

// Verificar si existe el archivo
if (!fs.existsSync(inputFile)) {
    console.error('❌ No se encontró el archivo backup-veterinaria.sql');
    console.log('Coloca el archivo de backup en la carpeta del proyecto');
    process.exit(1);
}

console.log('Importando base de datos...');
console.log(`Base de datos: ${dbConfig.database}`);
console.log(`Archivo: ${inputFile}\n`);

// Primero crear la base de datos si no existe
const createDbCommand = `mysql -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ''} -e "CREATE DATABASE IF NOT EXISTS ${dbConfig.database};"`;

exec(createDbCommand, (error) => {
    if (error) {
        console.error('❌ Error al crear base de datos:', error.message);
        console.log('\n💡 Comando manual:');
        console.log(`mysql -u ${dbConfig.user} -p -e "CREATE DATABASE IF NOT EXISTS ${dbConfig.database};"`);
        process.exit(1);
    }

    // Importar el archivo SQL
    const importCommand = `mysql -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ''} ${dbConfig.database} < "${inputFile}"`;

    exec(importCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error al importar:', error.message);
            console.log('\n💡 Comando manual:');
            console.log(`mysql -u ${dbConfig.user} -p ${dbConfig.database} < backup-veterinaria.sql`);
            process.exit(1);
        }

        if (stderr) {
            console.log(stderr);
        }

        console.log('✅ Base de datos importada exitosamente!');
        console.log('\n🚀 Siguiente paso:');
        console.log('npm start');
    });
});
