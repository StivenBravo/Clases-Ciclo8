// Script para iniciar todos los servidores a la vez
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando todos los servidores de la barbería...\n');

// Iniciar servidor 1 (Servicios)
const server1 = spawn('node', ['server1.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

// Iniciar servidor 2 (Citas)
const server2 = spawn('node', ['server2.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

// Iniciar servidor 3 (Barberos)
const server3 = spawn('node', ['server3.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

// Iniciar servidor 4 (Productos)
const server4 = spawn('node', ['server4.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

// Iniciar servidor 5 (Horarios)
const server5 = spawn('node', ['server5.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

// Iniciar servidor principal (interfaz web)
const serverMain = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

console.log('\n✅ Todos los servidores iniciados (5 servicios + 1 interfaz web)\n');
console.log('Presiona Ctrl+C para detener todos los servidores\n');

// Manejar el cierre
process.on('SIGINT', () => {
    console.log('\n\n🛑 Deteniendo todos los servidores...');
    server1.kill();
    server2.kill();
    server3.kill();
    server4.kill();
    server5.kill();
    serverMain.kill();
    process.exit();
});
