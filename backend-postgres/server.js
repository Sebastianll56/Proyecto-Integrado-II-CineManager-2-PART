require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB, pool } = require('./src/config/database');

const generoRoutes = require('./src/routes/genero.routes');
const directorRoutes = require('./src/routes/director.routes');
const productoraRoutes = require('./src/routes/productora.routes');
const tipoRoutes = require('./src/routes/tipo.routes');
const mediaRoutes = require('./src/routes/media.routes');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const origenesPermitidos = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
    origenesPermitidos.push('http://localhost:5173');
}

app.use(cors({
    origin(origen, callback) {
        if (!origen || origenesPermitidos.length === 0 || origenesPermitidos.includes(origen)) {
            return callback(null, true);
        }
        return callback(new Error('Origen no autorizado por la política CORS.'));
    }
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'API REST de CineManager - Películas y Series',
        estado: 'Funcionando correctamente',
        version: '1.0.0'
    });
});

app.get('/api/estado', (req, res) => {
    res.status(200).json({
        api: 'Activa',
        baseDatos: 'Neon PostgreSQL',
        servidor: 'PostgreSQL',
        modulos: ['Genero', 'Director', 'Productora', 'Tipo', 'Media']
    });
});

app.use('/api/generos', generoRoutes);
app.use('/api/directores', directorRoutes);
app.use('/api/productoras', productoraRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/media', mediaRoutes);

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: 'La ruta solicitada no existe.',
        metodo: req.method,
        ruta: req.originalUrl
    });
});

app.use((error, req, res, next) => {
    console.error('Error no controlado:', error.message);
    if (res.headersSent) return next(error);
    return res.status(500).json({ ok: false, mensaje: 'Ocurrió un error interno en el servidor.' });
});

async function iniciarServidor() {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`API CineManager escuchando en el puerto ${PORT}`);
            console.log('Base de datos PostgreSQL conectada.');
        });
    } catch (error) {
        console.error('No fue posible iniciar CineManager:', error.message);
        process.exit(1);
    }
}

async function cerrarServidor() {
    try {
        await pool.end();
    } finally {
        process.exit(0);
    }
}

process.on('SIGTERM', cerrarServidor);
process.on('SIGINT', cerrarServidor);

if (require.main === module) {
    iniciarServidor();
}

module.exports = app;
