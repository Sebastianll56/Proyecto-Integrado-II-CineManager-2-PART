const { pool } = require('../config/database');

const campos = `
    idproductora AS "IdProductora",
    nombre AS "Nombre",
    estado AS "Estado",
    fechacreacion AS "FechaCreacion",
    fechaactualizacion AS "FechaActualizacion",
    slogan AS "Slogan",
    descripcion AS "Descripcion"`;

function validarId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizarEstado(valor) {
    if (![true, false, 0, 1, '0', '1'].includes(valor)) return null;
    return valor === true || valor === 1 || valor === '1';
}

function validarDatos(body) {
    const { nombre, slogan, descripcion } = body;
    const estado = normalizarEstado(body.estado === undefined ? 1 : body.estado);
    if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 150) {
        return { error: 'El nombre es obligatorio y no puede superar 150 caracteres.' };
    }
    if (estado === null) return { error: 'El estado debe ser activo o inactivo.' };
    if (slogan != null && (typeof slogan !== 'string' || slogan.length > 250)) {
        return { error: 'El slogan no puede superar 250 caracteres.' };
    }
    if (descripcion != null && (typeof descripcion !== 'string' || descripcion.length > 500)) {
        return { error: 'La descripción no puede superar 500 caracteres.' };
    }
    return {
        datos: {
            nombre: nombre.trim(), estado,
            slogan: slogan?.trim() || null,
            descripcion: descripcion?.trim() || null
        }
    };
}

exports.listarProductoras = async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT ${campos} FROM productora ORDER BY idproductora ASC`);
        return res.status(200).json({ ok: true, total: rows.length, datos: rows });
    } catch (error) {
        console.error('Error al consultar productoras:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar las productoras.' });
    }
};

exports.obtenerProductora = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID debe ser un entero positivo.' });
    try {
        const { rows } = await pool.query(`SELECT ${campos} FROM productora WHERE idproductora = $1`, [id]);
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Productora no encontrada.' });
        return res.status(200).json({ ok: true, datos: rows[0] });
    } catch (error) {
        console.error('Error al consultar productora:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar la productora.' });
    }
};

exports.crearProductora = async (req, res) => {
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const { nombre, estado, slogan, descripcion } = validacion.datos;
    try {
        const { rows } = await pool.query(
            `INSERT INTO productora (nombre, estado, slogan, descripcion) VALUES ($1, $2, $3, $4) RETURNING ${campos}`,
            [nombre, estado, slogan, descripcion]
        );
        return res.status(201).json({ ok: true, mensaje: 'Productora registrada correctamente.', datos: rows[0] });
    } catch (error) {
        console.error('Error al registrar productora:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al registrar la productora.' });
    }
};

exports.actualizarProductora = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const { nombre, estado, slogan, descripcion } = validacion.datos;
    try {
        const { rows } = await pool.query(
            `UPDATE productora SET nombre = $1, estado = $2, fechaactualizacion = CURRENT_TIMESTAMP, slogan = $3, descripcion = $4 WHERE idproductora = $5 RETURNING ${campos}`,
            [nombre, estado, slogan, descripcion, id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Productora no encontrada.' });
        return res.status(200).json({ ok: true, mensaje: 'Productora actualizada correctamente.', datos: rows[0] });
    } catch (error) {
        console.error('Error al actualizar productora:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al actualizar la productora.' });
    }
};

exports.eliminarProductora = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    try {
        const { rows } = await pool.query(
            'DELETE FROM productora WHERE idproductora = $1 RETURNING idproductora AS "IdProductora", nombre AS "Nombre"',
            [id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Productora no encontrada.' });
        return res.status(200).json({ ok: true, mensaje: 'Productora eliminada correctamente.', datos: rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(409).json({ ok: false, mensaje: 'No se puede eliminar la productora porque está asociada a una película o serie.' });
        console.error('Error al eliminar productora:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al eliminar la productora.' });
    }
};
