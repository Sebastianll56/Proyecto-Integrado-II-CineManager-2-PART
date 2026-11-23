const { pool } = require('../config/database');

const campos = `
    idtipo AS "IdTipo",
    nombre AS "Nombre",
    fechacreacion AS "FechaCreacion",
    fechaactualizacion AS "FechaActualizacion",
    descripcion AS "Descripcion"`;

function validarId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function validarDatos(body) {
    const { nombre, descripcion } = body;
    if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 100) {
        return { error: 'El nombre del tipo es obligatorio y no puede superar 100 caracteres.' };
    }
    if (descripcion != null && (typeof descripcion !== 'string' || descripcion.length > 500)) {
        return { error: 'La descripción no puede superar 500 caracteres.' };
    }
    return { datos: { nombre: nombre.trim(), descripcion: descripcion?.trim() || null } };
}

exports.listarTipos = async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT ${campos} FROM tipo ORDER BY idtipo ASC`);
        return res.status(200).json({ ok: true, total: rows.length, datos: rows });
    } catch (error) {
        console.error('Error al consultar tipos:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar los tipos.' });
    }
};

exports.obtenerTipo = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID debe ser un entero positivo.' });
    try {
        const { rows } = await pool.query(`SELECT ${campos} FROM tipo WHERE idtipo = $1`, [id]);
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Tipo no encontrado.' });
        return res.status(200).json({ ok: true, datos: rows[0] });
    } catch (error) {
        console.error('Error al obtener tipo:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar el tipo.' });
    }
};

exports.crearTipo = async (req, res) => {
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const { nombre, descripcion } = validacion.datos;
    try {
        const { rows } = await pool.query(
            `INSERT INTO tipo (nombre, descripcion) VALUES ($1, $2) RETURNING ${campos}`,
            [nombre, descripcion]
        );
        return res.status(201).json({ ok: true, mensaje: 'Tipo registrado correctamente.', datos: rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ ok: false, mensaje: 'Ya existe un tipo con ese nombre.' });
        console.error('Error al registrar tipo:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al registrar el tipo.' });
    }
};

exports.actualizarTipo = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const { nombre, descripcion } = validacion.datos;
    try {
        const { rows } = await pool.query(
            `UPDATE tipo SET nombre = $1, fechaactualizacion = CURRENT_TIMESTAMP, descripcion = $2 WHERE idtipo = $3 RETURNING ${campos}`,
            [nombre, descripcion, id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Tipo no encontrado.' });
        return res.status(200).json({ ok: true, mensaje: 'Tipo actualizado correctamente.', datos: rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ ok: false, mensaje: 'Ya existe otro tipo con ese nombre.' });
        console.error('Error al actualizar tipo:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el tipo.' });
    }
};

exports.eliminarTipo = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    try {
        const { rows } = await pool.query(
            'DELETE FROM tipo WHERE idtipo = $1 RETURNING idtipo AS "IdTipo", nombre AS "Nombre"',
            [id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Tipo no encontrado.' });
        return res.status(200).json({ ok: true, mensaje: 'Tipo eliminado correctamente.', datos: rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(409).json({ ok: false, mensaje: 'No se puede eliminar el tipo porque está asociado a una película o serie.' });
        console.error('Error al eliminar tipo:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al eliminar el tipo.' });
    }
};
