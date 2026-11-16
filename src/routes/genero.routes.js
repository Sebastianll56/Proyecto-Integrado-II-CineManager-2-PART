
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: GENERO
   RUTAS DE LA API REST
   ============================================================ */

const express = require('express');
const router = express.Router();

const generoController = require('../controllers/genero.controller');

// Verificar que el controlador tenga todas sus funciones
const funcionesRequeridas = [
    'listarGeneros',
    'obtenerGenero',
    'crearGenero',
    'actualizarGenero',
    'eliminarGenero'
];

for (const funcion of funcionesRequeridas) {
    if (typeof generoController[funcion] !== 'function') {
        throw new Error(
            `La funcion ${funcion} no existe en genero.controller.js`
        );
    }
}

// GET: Listar todos los generos
router.get('/', generoController.listarGeneros);

// GET: Obtener un genero por ID
router.get('/:id', generoController.obtenerGenero);

// POST: Crear un genero
router.post('/', generoController.crearGenero);

// PUT: Actualizar un genero
router.put('/:id', generoController.actualizarGenero);

// DELETE: Eliminar un genero
router.delete('/:id', generoController.eliminarGenero);

module.exports = router;
