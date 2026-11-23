
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: MEDIA
   RUTAS DE LA API REST
   ============================================================ */

const express = require('express');
const router = express.Router();

const mediaController = require('../controllers/media.controller');

// Verificar las funciones del controlador
const funciones = [
    'listarMedia',
    'obtenerMedia',
    'crearMedia',
    'actualizarMedia',
    'eliminarMedia'
];

for (const funcion of funciones) {
    if (typeof mediaController[funcion] !== 'function') {
        throw new Error(
            `La funcion ${funcion} no existe en media.controller.js`
        );
    }
}

// GET: Consultar todas las peliculas y series
router.get('/', mediaController.listarMedia);

// GET: Consultar una pelicula o serie por ID
router.get('/:id', mediaController.obtenerMedia);

// POST: Registrar una pelicula o serie
router.post('/', mediaController.crearMedia);

// PUT: Actualizar una pelicula o serie
router.put('/:id', mediaController.actualizarMedia);

// DELETE: Eliminar una pelicula o serie
router.delete('/:id', mediaController.eliminarMedia);

module.exports = router;
