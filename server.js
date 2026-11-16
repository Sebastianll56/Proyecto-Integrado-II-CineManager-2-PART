
/* ============================================================
   PROYECTO INTEGRADO 2
   DESARROLLO DE APLICACIONES
   API REST - GESTION DE PELICULAS Y SERIES

   Archivo principal: server.js
   Tecnologias: Node.js, Express y SQL Server
   ============================================================ */


// ============================================================
// 1. IMPORTACION DE DEPENDENCIAS
// ============================================================

const express = require('express');
const cors = require('cors');

const { connectDB } = require('./src/config/database');


// ============================================================
// 2. IMPORTACION DE RUTAS
// ============================================================

const generoRoutes = require('./src/routes/genero.routes');

const directorRoutes = require('./src/routes/director.routes');

const productoraRoutes = require('./src/routes/productora.routes');

const tipoRoutes = require('./src/routes/tipo.routes');

const mediaRoutes = require('./src/routes/media.routes');


// ============================================================
// 3. CONFIGURACION DE EXPRESS
// ============================================================

const app = express();

const PORT = 3001;


// ============================================================
// 4. MIDDLEWARES
// ============================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ============================================================
// 5. RUTA PRINCIPAL
// ============================================================

app.get('/', (req, res) => {

    res.status(200).json({
        mensaje: 'API REST de Peliculas y Series',
        estado: 'Funcionando correctamente',
        version: '1.0.0'
    });

});


// ============================================================
// 6. ESTADO DE LA API
// ============================================================

app.get('/api/estado', (req, res) => {

    res.status(200).json({
        api: 'Activa',
        baseDatos: 'ProyectoIntegrado2_Peliculas',
        servidor: 'SQL Server 2025',

        modulos: [
            'Genero',
            'Director',
            'Productora',
            'Tipo',
            'Media'
        ]
    });

});


// ============================================================
// 7. REGISTRO DE RUTAS DE LOS CINCO MODULOS
// ============================================================

// Modulo Genero
app.use('/api/generos', generoRoutes);

// Modulo Director
app.use('/api/directores', directorRoutes);

// Modulo Productora
app.use('/api/productoras', productoraRoutes);

// Modulo Tipo
app.use('/api/tipos', tipoRoutes);

// Modulo Media
app.use('/api/media', mediaRoutes);


// ============================================================
// 8. MANEJO DE RUTAS NO ENCONTRADAS
// ============================================================

app.use((req, res) => {

    res.status(404).json({
        ok: false,
        mensaje: 'La ruta solicitada no existe.',
        metodo: req.method,
        ruta: req.originalUrl
    });

});


// ============================================================
// 9. INICIAR SERVIDOR Y CONECTAR BASE DE DATOS
// ============================================================

async function iniciarServidor() {

    try {

        console.log('');
        console.log('========================================');
        console.log('CONECTANDO CON SQL SERVER...');
        console.log('========================================');

        // Conectar con SQL Server
        await connectDB();

        console.log('');
        console.log('CONEXION CON SQL SERVER ESTABLECIDA');


        // Iniciar Express
        const servidor = app.listen(PORT, () => {

            console.log('');
            console.log('========================================');
            console.log('API REST INICIADA CORRECTAMENTE');
            console.log('========================================');

            console.log('');
            console.log(`SERVIDOR: http://localhost:${PORT}`);

            console.log('');
            console.log('MODULOS DISPONIBLES:');

            console.log(
                `GENERO: http://localhost:${PORT}/api/generos`
            );

            console.log(
                `DIRECTOR: http://localhost:${PORT}/api/directores`
            );

            console.log(
                `PRODUCTORA: http://localhost:${PORT}/api/productoras`
            );

            console.log(
                `TIPO: http://localhost:${PORT}/api/tipos`
            );

            console.log(
                `MEDIA: http://localhost:${PORT}/api/media`
            );

            console.log(
                `ESTADO: http://localhost:${PORT}/api/estado`
            );

            console.log('');
            console.log('========================================');
            console.log('SERVIDOR EN EJECUCION');
            console.log('NO CIERRES ESTA TERMINAL');
            console.log('========================================');

        });


        // Manejar errores del servidor
        servidor.on('error', (error) => {

            console.error('');

            if (error.code === 'EADDRINUSE') {

                console.error(
                    `El puerto ${PORT} ya esta siendo utilizado.`
                );

            } else {

                console.error(
                    'ERROR EN EL SERVIDOR:',
                    error.message
                );

            }

        });

    } catch (error) {

        console.error('');
        console.error('========================================');
        console.error('ERROR AL INICIAR LA API REST');
        console.error('========================================');

        console.error(error.message);

        process.exitCode = 1;

    }

}


// ============================================================
// 10. EJECUTAR APLICACION
// ============================================================

iniciarServidor();
