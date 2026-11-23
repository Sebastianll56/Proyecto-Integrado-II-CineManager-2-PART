const { pool } = require('../config/database');

const campos = `
    idgenero AS "IdGenero",
    nombre AS "Nombre",
    estado AS "Estado",
    fechacreacion AS "FechaCreacion",
    fechaactualizacion AS "FechaActualizacion",
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
    const { nombre, descripcion } = body;
    const estado = normalizarEstado(body.estado === undefined ? 1 : body.estado);

    if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 100) {
        return { error: 'El nombre es obligatorio y no puede superar 100 caracteres.' };
    }
    if (estado === null) return { error: 'El estado debe ser activo o inactivo.' };
    if (descripcion != null && (typeof descripcion !== 'string' || descripcion.length > 500)) {
        return { error: 'La descripción no es válida.' };
    }
    return { datos: { nombre: nombre.trim(), estado, descripcion: descripcion?.trim() || null } };
}

exports.listarGeneros = async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT ${campos} FROM genero ORDER BY idgenero ASC`);
        return res.status(200).json({ ok: true, total: rows.length, datos: rows });
    } catch (error) {
        console.error('Error al listar géneros:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar los géneros.' });
    }
};

exports.obtenerGenero = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID debe ser un entero positivo.' });
    try {
        const { rows } = await pool.query(`SELECT ${campos} FROM genero WHERE idgenero = $1`, [id]);
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Género no encontrado.' });
        return res.status(200).json({ ok: true, datos: rows[0] });
    } catch (error) {
        console.error('Error al obtener género:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar el género.' });
    }
};

exports.crearGenero = async (req, res) => {
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const { nombre, estado, descripcion } = validacion.datos;
    try {
        const { rows } = await pool.query(
            `INSERT INTO genero (nombre, estado, descripcion) VALUES ($1, $2, $3) RETURNING ${campos}`,
            [nombre, estado, descripcion]
        );
        return res.status(201).json({ ok: true, mensaje: 'Género registrado correctamente.', datos: rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ ok: false, mensaje: 'Ya existe un género con ese nombre.' });
        console.error('Error al crear género:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al registrar el género.' });
    }
};

exports.actualizarGenero = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const { nombre, estado, descripcion } = validacion.datos;
    try {
        const { rows } = await pool.query(
            `UPDATE genero SET nombre = $1, estado = $2, descripcion = $3, fechaactualizacion = CURRENT_TIMESTAMP WHERE idgenero = $4 RETURNING ${campos}`,
            [nombre, estado, descripcion, id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Género no encontrado.' });
        return res.status(200).json({ ok: true, mensaje: 'Género actualizado correctamente.', datos: rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ ok: false, mensaje: 'Ya existe otro género con ese nombre.' });
        console.error('Error al actualizar género:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el género.' });
    }
};

exports.eliminarGenero = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    try {
        const { rows } = await pool.query(
            'DELETE FROM genero WHERE idgenero = $1 RETURNING idgenero AS "IdGenero", nombre AS "Nombre"',
            [id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Género no encontrado.' });
        return res.status(200).json({ ok: true, mensaje: 'Género eliminado correctamente.', datos: rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(409).json({ ok: false, mensaje: 'No se puede eliminar porque el género está asociado a una película o serie.' });
        console.error('Error al eliminar género:', error.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al eliminar el género.' });
    }
};
