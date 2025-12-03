const { spawn } = require('child_process');
const path = require('path');
console.log('   INICIANDO TODOS LOS SERVICIOS');

// Lista de servicios a iniciar
const services = [
    { name: 'Gateway', script: 'gateway.js', port: 3000 },
    { name: 'Auth', script: 'services/auth/server.js', port: 3006 },
    { name: 'Clientes', script: 'services/clientes/server.js', port: 3001 },
    { name: 'Mascotas', script: 'services/mascotas/server.js', port: 3002 },
    { name: 'Citas', script: 'services/citas/server.js', port: 3003 },
    { name: 'Productos', script: 'services/productos/server.js', port: 3004 },
    { name: 'Trabajadores', script: 'services/trabajadores/server.js', port: 3005 }
];

// Procesos en ejecución
const processes = [];

// Función para iniciar un servicio
function startService(service) {
    const scriptPath = path.join(__dirname, service.script);

    const proc = spawn('node', [scriptPath], {
        stdio: 'inherit',
        shell: true
    });

    proc.on('error', (error) => {
        console.error(`Error al iniciar ${service.name}:`, error.message);
    });

    proc.on('exit', (code) => {
        if (code !== 0) {
            console.log(`${service.name} terminó con código ${code}`);
        }
    });

    processes.push({ name: service.name, process: proc });
    console.log(`${service.name} iniciado en puerto ${service.port}`);
}

// Iniciar todos los servicios
services.forEach(service => {
    startService(service);
});

console.log('Todos los servicios iniciados');

// Manejar la señal de terminación
process.on('SIGINT', () => {
    console.log('Deteniendo todos los servicios...\n');

    processes.forEach(({ name, process }) => {
        console.log(`Deteniendo ${name}...`);
        process.kill();
    });

    console.log('Todos los servicios detenidos\n');
    process.exit(0);
});

// Evitar que el proceso principal termine
process.stdin.resume();
