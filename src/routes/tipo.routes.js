
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: TIPO
   RUTAS DE LA API REST
   ============================================================ */

const express = require('express');
const router = express.Router();

const tipoController = require('../controllers/tipo.controller');

// Verificar las funciones del controlador
const funciones = [
    'listarTipos',
    'obtenerTipo',
    'crearTipo',
    'actualizarTipo',
    'eliminarTipo'
];

for (const funcion of funciones) {
    if (typeof tipoController[funcion] !== 'function') {
        throw new Error(
            `La funcion ${funcion} no existe en tipo.controller.js`
        );
    }
}

// GET: Consultar todos los tipos
router.get('/', tipoController.listarTipos);

// GET: Consultar un tipo por ID
router.get('/:id', tipoController.obtenerTipo);

// POST: Registrar un tipo
router.post('/', tipoController.crearTipo);

// PUT: Actualizar un tipo
router.put('/:id', tipoController.actualizarTipo);

// DELETE: Eliminar un tipo
router.delete('/:id', tipoController.eliminarTipo);

module.exports = router;
