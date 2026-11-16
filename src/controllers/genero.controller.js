
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: GENERO
   CONTROLADOR DE OPERACIONES CRUD
   ============================================================ */

const { sql } = require('../config/database');

// ------------------------------------------------------------
// GET: CONSULTAR TODOS LOS GENEROS
// ------------------------------------------------------------

exports.listarGeneros = async (req, res) => {
    try {
        const resultado = await new sql.Request().query(`
            SELECT
                IdGenero,
                Nombre,
                Estado,
                FechaCreacion,
                FechaActualizacion,
                Descripcion
            FROM dbo.Genero
            ORDER BY IdGenero ASC;
        `);

        return res.status(200).json({
            ok: true,
            total: resultado.recordset.length,
            datos: resultado.recordset
        });

    } catch (error) {
        console.error('Error al listar generos:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar los generos.'
        });
    }
};


// ------------------------------------------------------------
// GET: CONSULTAR UN GENERO POR ID
// ------------------------------------------------------------

exports.obtenerGenero = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID debe ser un entero positivo.'
            });
        }

        const solicitud = new sql.Request();
        solicitud.input('id', sql.Int, id);

        const resultado = await solicitud.query(`
            SELECT *
            FROM dbo.Genero
            WHERE IdGenero = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Genero no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al obtener genero:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar el genero.'
        });
    }
};


// ------------------------------------------------------------
// POST: REGISTRAR UN GENERO
// ------------------------------------------------------------

exports.crearGenero = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const estado = req.body.estado === undefined
            ? 1
            : req.body.estado;

        if (typeof nombre !== 'string' || !nombre.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El nombre del genero es obligatorio.'
            });
        }

        if (nombre.trim().length > 100) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El nombre no puede superar 100 caracteres.'
            });
        }

        if (![true, false, 0, 1, '0', '1'].includes(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado debe ser activo o inactivo.'
            });
        }

        if (
            descripcion != null &&
            (
                typeof descripcion !== 'string' ||
                descripcion.length > 500
            )
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La descripcion no es valida.'
            });
        }

        const estadoFinal =
            estado === true || estado === 1 || estado === '1'
                ? 1 : 0;

        const solicitud = new sql.Request();

        solicitud.input(
            'nombre',
            sql.NVarChar(100),
            nombre.trim()
        );

        solicitud.input(
            'estado',
            sql.Bit,
            estadoFinal
        );

        solicitud.input(
            'descripcion',
            sql.NVarChar(500),
            descripcion?.trim() || null
        );

        const resultado = await solicitud.query(`
            INSERT INTO dbo.Genero
                (Nombre, Estado, Descripcion)
            OUTPUT INSERTED.*
            VALUES
                (@nombre, @estado, @descripcion);
        `);

        return res.status(201).json({
            ok: true,
            mensaje: 'Genero registrado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        if (error.number === 2601 || error.number === 2627) {
            return res.status(409).json({
                ok: false,
                mensaje: 'Ya existe un genero con ese nombre.'
            });
        }

        console.error('Error al crear genero:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al registrar el genero.'
        });
    }
};


// ------------------------------------------------------------
// PUT: ACTUALIZAR UN GENERO
// ------------------------------------------------------------

exports.actualizarGenero = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, descripcion } = req.body;

        const estado = req.body.estado === undefined
            ? 1
            : req.body.estado;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID no es valido.'
            });
        }

        if (
            typeof nombre !== 'string' ||
            !nombre.trim() ||
            nombre.trim().length > 100
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El nombre es obligatorio y no puede superar 100 caracteres.'
            });
        }

        if (![true, false, 0, 1, '0', '1'].includes(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado debe ser activo o inactivo.'
            });
        }

        if (
            descripcion != null &&
            (
                typeof descripcion !== 'string' ||
                descripcion.length > 500
            )
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La descripcion no es valida.'
            });
        }

        const estadoFinal =
            estado === true || estado === 1 || estado === '1'
                ? 1 : 0;

        const solicitud = new sql.Request();

        solicitud.input('id', sql.Int, id);
        solicitud.input('nombre', sql.NVarChar(100), nombre.trim());
        solicitud.input('estado', sql.Bit, estadoFinal);
        solicitud.input(
            'descripcion',
            sql.NVarChar(500),
            descripcion?.trim() || null
        );

        const resultado = await solicitud.query(`
            UPDATE dbo.Genero
            SET
                Nombre = @nombre,
                Estado = @estado,
                Descripcion = @descripcion,
                FechaActualizacion = SYSDATETIME()
            OUTPUT INSERTED.*
            WHERE IdGenero = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Genero no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Genero actualizado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        if (error.number === 2601 || error.number === 2627) {
            return res.status(409).json({
                ok: false,
                mensaje: 'Ya existe otro genero con ese nombre.'
            });
        }

        console.error('Error al actualizar genero:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar el genero.'
        });
    }
};


// ------------------------------------------------------------
// DELETE: ELIMINAR UN GENERO
// ------------------------------------------------------------

exports.eliminarGenero = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID no es valido.'
            });
        }

        const solicitud = new sql.Request();
        solicitud.input('id', sql.Int, id);

        const resultado = await solicitud.query(`
            DELETE FROM dbo.Genero
            OUTPUT DELETED.IdGenero, DELETED.Nombre
            WHERE IdGenero = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Genero no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Genero eliminado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        if (error.number === 547) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar porque el genero esta asociado a una pelicula o serie.'
            });
        }

        console.error('Error al eliminar genero:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar el genero.'
        });
    }
};
