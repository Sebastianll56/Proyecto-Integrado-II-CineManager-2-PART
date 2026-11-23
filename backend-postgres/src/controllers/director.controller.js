const { pool } = require('../config/database');

const campos = `
    iddirector AS "IdDirector",
    nombres AS "Nombres",
    estado AS "Estado",
    fechacreacion AS "FechaCreacion",
    fechaactualizacion AS "FechaActualizacion"`;

function validarId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizarEstado(valor) {
    if (![true, false, 0, 1, '0', '1'].includes(valor)) return null;
    return valor === true || valor === 1 || valor === '1';
}

function validarDatos(body) {
    const { nombres } = body;
    const estado = normalizarEstado(body.estado === undefined ? 1 : body.estado);
    if (typeof nombres !== 'string' || !nombres.trim() || nombres.trim().length > 150) {
        return { error: 'Los nombres son obligatorios y no pueden superar 150 caracteres.' };
    }
    if (estado === null) return { error: 'El estado debe ser activo o inactivo.' };
    return { datos: { nombres: nombres.trim(), estado } };
}

exports.listarDirectores = async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT ${campos} FROM director ORDER BY iddirector ASC`);
        return res.status(200).json({ ok: true, total: rows.length, datos: rows });
    } catch (error) {
        console.error('Error al consultar directores:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar los directores.' });
    }
};

exports.obtenerDirector = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID debe ser un entero positivo.' });
    try {
        const { rows } = await pool.query(`SELECT ${campos} FROM director WHERE iddirector = $1`, [id]);
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Director no encontrado.' });
        return res.status(200).json({ ok: true, datos: rows[0] });
    } catch (error) {
        console.error('Error al obtener director:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar el director.' });
    }
};

exports.crearDirector = async (req, res) => {
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const { nombres, estado } = validacion.datos;
    try {
        const { rows } = await pool.query(
            `INSERT INTO director (nombres, estado) VALUES ($1, $2) RETURNING ${campos}`,
            [nombres, estado]
        );
        return res.status(201).json({ ok: true, mensaje: 'Director registrado correctamente.', datos: rows[0] });
    } catch (error) {
        console.error('Error al registrar director:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al registrar el director.' });
    }
};

exports.actualizarDirector = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const { nombres, estado } = validacion.datos;
    try {
        const { rows } = await pool.query(
            `UPDATE director SET nombres = $1, estado = $2, fechaactualizacion = CURRENT_TIMESTAMP WHERE iddirector = $3 RETURNING ${campos}`,
            [nombres, estado, id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Director no encontrado.' });
        return res.status(200).json({ ok: true, mensaje: 'Director actualizado correctamente.', datos: rows[0] });
    } catch (error) {
        console.error('Error al actualizar director:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el director.' });
    }
};

exports.eliminarDirector = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    try {
        const { rows } = await pool.query(
            'DELETE FROM director WHERE iddirector = $1 RETURNING iddirector AS "IdDirector", nombres AS "Nombres"',
            [id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Director no encontrado.' });
        return res.status(200).json({ ok: true, mensaje: 'Director eliminado correctamente.', datos: rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(409).json({ ok: false, mensaje: 'No se puede eliminar el director porque está asociado a una película o serie.' });
        console.error('Error al eliminar director:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al eliminar el director.' });
    }
};
