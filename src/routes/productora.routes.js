
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: PRODUCTORA
   RUTAS DE LA API REST
   ============================================================ */

const express = require('express');
const router = express.Router();

const productoraController = require('../controllers/productora.controller');

// Verificar las funciones del controlador
const funciones = [
    'listarProductoras',
    'obtenerProductora',
    'crearProductora',
    'actualizarProductora',
    'eliminarProductora'
];

for (const funcion of funciones) {
    if (typeof productoraController[funcion] !== 'function') {
        throw new Error(
            `La funcion ${funcion} no existe en productora.controller.js`
        );
    }
}

// GET: Consultar todas las productoras
router.get('/', productoraController.listarProductoras);

// GET: Consultar una productora por ID
router.get('/:id', productoraController.obtenerProductora);

// POST: Registrar una productora
router.post('/', productoraController.crearProductora);

// PUT: Actualizar una productora
router.put('/:id', productoraController.actualizarProductora);

// DELETE: Eliminar una productora
router.delete('/:id', productoraController.eliminarProductora);

module.exports = router;
