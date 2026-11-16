
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: DIRECTOR
   RUTAS DE LA API REST
   ============================================================ */

const express = require('express');
const router = express.Router();

const directorController = require('../controllers/director.controller');

// Verificar las funciones del controlador
const funciones = [
    'listarDirectores',
    'obtenerDirector',
    'crearDirector',
    'actualizarDirector',
    'eliminarDirector'
];

for (const funcion of funciones) {
    if (typeof directorController[funcion] !== 'function') {
        throw new Error(
            `La funcion ${funcion} no existe en director.controller.js`
        );
    }
}

// GET: Consultar todos los directores
router.get('/', directorController.listarDirectores);

// GET: Consultar director por ID
router.get('/:id', directorController.obtenerDirector);

// POST: Registrar director
router.post('/', directorController.crearDirector);

// PUT: Actualizar director
router.put('/:id', directorController.actualizarDirector);

// DELETE: Eliminar director
router.delete('/:id', directorController.eliminarDirector);

module.exports = router;
