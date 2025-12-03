const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_GATEWAY || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// URLs de los microservicios
const SERVICES = {
    auth: `http://localhost:${process.env.PORT_AUTH || 3006}`,
    clientes: `http://localhost:${process.env.PORT_CLIENTES || 3001}`,
    mascotas: `http://localhost:${process.env.PORT_MASCOTAS || 3002}`,
    citas: `http://localhost:${process.env.PORT_CITAS || 3003}`,
    productos: `http://localhost:${process.env.PORT_PRODUCTOS || 3004}`,
    trabajadores: `http://localhost:${process.env.PORT_TRABAJADORES || 3005}`
};

// Middleware para manejar errores de servicios
const handleServiceError = (error, serviceName) => {
    console.error(`Error en servicio ${serviceName}:`, error.message);
    return {
        success: false,
        message: `El servicio de ${serviceName} no está disponible`,
        error: error.message
    };
};

// Rutas principales
// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Health check
app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'Connected' : 'Disconnected',
        services: {}
    };

    // Verificar estado de cada servicio
    for (const [name, url] of Object.entries(SERVICES)) {
        try {
            await axios.get(`${url}/api/health`, { timeout: 2000 });
            health.services[name] = 'UP';
        } catch (error) {
            health.services[name] = 'DOWN';
        }
    }

    res.json(health);
});

// Proxies para microservicios
app.all('/api/auth*', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${SERVICES.auth}${req.originalUrl}`,
            data: req.body,
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || handleServiceError(error, 'auth'));
    }
});

// Proxy para clientes
app.all('/api/clientes*', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${SERVICES.clientes}${req.originalUrl}`,
            data: req.body,
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || handleServiceError(error, 'clientes'));
    }
});

// Proxy para mascotas
app.all('/api/mascotas*', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${SERVICES.mascotas}${req.originalUrl}`,
            data: req.body,
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || handleServiceError(error, 'mascotas'));
    }
});

// Proxy para citas
app.all('/api/citas*', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${SERVICES.citas}${req.originalUrl}`,
            data: req.body,
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || handleServiceError(error, 'citas'));
    }
});

// Proxy para productos
app.all('/api/productos*', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${SERVICES.productos}${req.originalUrl}`,
            data: req.body,
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || handleServiceError(error, 'productos'));
    }
});

// Proxy para trabajadores y tratamientos
app.all('/api/trabajadores*', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${SERVICES.trabajadores}${req.originalUrl}`,
            data: req.body,
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || handleServiceError(error, 'trabajadores'));
    }
});

app.all('/api/tratamientos*', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${SERVICES.trabajadores}${req.originalUrl}`,
            data: req.body,
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || handleServiceError(error, 'tratamientos'));
    }
});

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Iniciar Gateway
app.listen(PORT, async () => {
    console.log(`Gateway corriendo en http://localhost:${PORT}`);
    console.log('Servicios configurados:');
    console.log(`   - Clientes:     ${SERVICES.clientes}`);
    console.log(`   - Mascotas:     ${SERVICES.mascotas}`);
    console.log(`   - Citas:        ${SERVICES.citas}`);
    console.log(`   - Productos:    ${SERVICES.productos}`);
    console.log(`   - Trabajadores: ${SERVICES.trabajadores}`);
    await testConnection();
    console.log('\nGateway iniciado correctamente\n');
});
