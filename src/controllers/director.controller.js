
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: DIRECTOR
   CONTROLADOR DE OPERACIONES CRUD
   ============================================================ */

const { sql } = require('../config/database');


// ============================================================
// 1. CONSULTAR TODOS LOS DIRECTORES
// ============================================================

exports.listarDirectores = async (req, res) => {
    try {
        const resultado = await new sql.Request().query(`
            SELECT
                IdDirector,
                Nombres,
                Estado,
                FechaCreacion,
                FechaActualizacion
            FROM dbo.Director
            ORDER BY IdDirector ASC;
        `);

        return res.status(200).json({
            ok: true,
            total: resultado.recordset.length,
            datos: resultado.recordset
        });

    } catch (error) {
        console.error('Error al consultar directores:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar los directores.'
        });
    }
};


// ============================================================
// 2. CONSULTAR UN DIRECTOR POR ID
// ============================================================

exports.obtenerDirector = async (req, res) => {
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
            SELECT
                IdDirector,
                Nombres,
                Estado,
                FechaCreacion,
                FechaActualizacion
            FROM dbo.Director
            WHERE IdDirector = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Director no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al obtener director:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar el director.'
        });
    }
};


// ============================================================
// 3. REGISTRAR UN DIRECTOR
// ============================================================

exports.crearDirector = async (req, res) => {
    try {
        const { nombres } = req.body;

        const estado = req.body.estado === undefined
            ? 1
            : req.body.estado;

        if (
            typeof nombres !== 'string' ||
            nombres.trim() === ''
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Los nombres del director son obligatorios.'
            });
        }

        if (nombres.trim().length > 150) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Los nombres no pueden superar 150 caracteres.'
            });
        }

        if (![true, false, 0, 1, '0', '1'].includes(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado debe ser activo o inactivo.'
            });
        }

        const estadoFinal =
            estado === true || estado === 1 || estado === '1'
                ? 1 : 0;

        const solicitud = new sql.Request();

        solicitud.input(
            'nombres',
            sql.NVarChar(150),
            nombres.trim()
        );

        solicitud.input(
            'estado',
            sql.Bit,
            estadoFinal
        );

        const resultado = await solicitud.query(`
            INSERT INTO dbo.Director
                (Nombres, Estado)
            OUTPUT INSERTED.*
            VALUES
                (@nombres, @estado);
        `);

        return res.status(201).json({
            ok: true,
            mensaje: 'Director registrado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al registrar director:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al registrar el director.'
        });
    }
};


// ============================================================
// 4. ACTUALIZAR UN DIRECTOR
// ============================================================

exports.actualizarDirector = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { nombres } = req.body;

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
            typeof nombres !== 'string' ||
            nombres.trim() === '' ||
            nombres.trim().length > 150
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Los nombres son obligatorios y no pueden superar 150 caracteres.'
            });
        }

        if (![true, false, 0, 1, '0', '1'].includes(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El estado debe ser activo o inactivo.'
            });
        }

        const estadoFinal =
            estado === true || estado === 1 || estado === '1'
                ? 1 : 0;

        const solicitud = new sql.Request();

        solicitud.input('id', sql.Int, id);

        solicitud.input(
            'nombres',
            sql.NVarChar(150),
            nombres.trim()
        );

        solicitud.input(
            'estado',
            sql.Bit,
            estadoFinal
        );

        const resultado = await solicitud.query(`
            UPDATE dbo.Director
            SET
                Nombres = @nombres,
                Estado = @estado,
                FechaActualizacion = SYSDATETIME()
            OUTPUT INSERTED.*
            WHERE IdDirector = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Director no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Director actualizado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al actualizar director:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar el director.'
        });
    }
};


// ============================================================
// 5. ELIMINAR UN DIRECTOR
// ============================================================

exports.eliminarDirector = async (req, res) => {
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
            DELETE FROM dbo.Director
            OUTPUT
                DELETED.IdDirector,
                DELETED.Nombres
            WHERE IdDirector = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Director no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Director eliminado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        if (error.number === 547) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar el director porque esta asociado a una pelicula o serie.'
            });
        }

        console.error('Error al eliminar director:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar el director.'
        });
    }
};
