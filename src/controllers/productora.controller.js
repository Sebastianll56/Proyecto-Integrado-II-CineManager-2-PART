
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: PRODUCTORA
   CONTROLADOR DE OPERACIONES CRUD
   ============================================================ */

const { sql } = require('../config/database');


// ============================================================
// VALIDAR DATOS DE PRODUCTORA
// ============================================================

function validarDatos(req, res) {
    const { nombre, slogan, descripcion } = req.body;

    const estado = req.body.estado === undefined
        ? 1
        : req.body.estado;

    if (typeof nombre !== 'string' || !nombre.trim()) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre de la productora es obligatorio.'
        });
        return null;
    }

    if (nombre.trim().length > 150) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre no puede superar 150 caracteres.'
        });
        return null;
    }

    if (![true, false, 0, 1, '0', '1'].includes(estado)) {
        res.status(400).json({
            ok: false,
            mensaje: 'El estado debe ser activo o inactivo.'
        });
        return null;
    }

    if (
        slogan != null &&
        (typeof slogan !== 'string' || slogan.length > 250)
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'El slogan no puede superar 250 caracteres.'
        });
        return null;
    }

    if (
        descripcion != null &&
        (typeof descripcion !== 'string' || descripcion.length > 500)
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'La descripcion no puede superar 500 caracteres.'
        });
        return null;
    }

    return {
        nombre: nombre.trim(),
        estado: estado === true || estado === 1 || estado === '1' ? 1 : 0,
        slogan: slogan?.trim() || null,
        descripcion: descripcion?.trim() || null
    };
}


// ============================================================
// 1. CONSULTAR TODAS LAS PRODUCTORAS
// ============================================================

exports.listarProductoras = async (req, res) => {
    try {
        const resultado = await new sql.Request().query(`
            SELECT
                IdProductora,
                Nombre,
                Estado,
                FechaCreacion,
                FechaActualizacion,
                Slogan,
                Descripcion
            FROM dbo.Productora
            ORDER BY IdProductora ASC;
        `);

        return res.status(200).json({
            ok: true,
            total: resultado.recordset.length,
            datos: resultado.recordset
        });

    } catch (error) {
        console.error('Error al consultar productoras:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar las productoras.'
        });
    }
};


// ============================================================
// 2. CONSULTAR UNA PRODUCTORA POR ID
// ============================================================

exports.obtenerProductora = async (req, res) => {
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
                IdProductora,
                Nombre,
                Estado,
                FechaCreacion,
                FechaActualizacion,
                Slogan,
                Descripcion
            FROM dbo.Productora
            WHERE IdProductora = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Productora no encontrada.'
            });
        }

        return res.status(200).json({
            ok: true,
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al consultar productora:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar la productora.'
        });
    }
};


// ============================================================
// 3. REGISTRAR UNA PRODUCTORA
// ============================================================

exports.crearProductora = async (req, res) => {
    try {
        const datos = validarDatos(req, res);

        if (!datos) return;

        const solicitud = new sql.Request();

        solicitud.input('nombre', sql.NVarChar(150), datos.nombre);
        solicitud.input('estado', sql.Bit, datos.estado);
        solicitud.input('slogan', sql.NVarChar(250), datos.slogan);
        solicitud.input('descripcion', sql.NVarChar(500), datos.descripcion);

        const resultado = await solicitud.query(`
            INSERT INTO dbo.Productora
                (
                    Nombre,
                    Estado,
                    FechaCreacion,
                    FechaActualizacion,
                    Slogan,
                    Descripcion
                )
            OUTPUT
                INSERTED.IdProductora,
                INSERTED.Nombre,
                INSERTED.Estado,
                INSERTED.FechaCreacion,
                INSERTED.FechaActualizacion,
                INSERTED.Slogan,
                INSERTED.Descripcion
            VALUES
                (
                    @nombre,
                    @estado,
                    SYSDATETIME(),
                    NULL,
                    @slogan,
                    @descripcion
                );
        `);

        return res.status(201).json({
            ok: true,
            mensaje: 'Productora registrada correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al registrar productora:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al registrar la productora.'
        });
    }
};


// ============================================================
// 4. ACTUALIZAR UNA PRODUCTORA
// ============================================================

exports.actualizarProductora = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID no es valido.'
            });
        }

        const datos = validarDatos(req, res);

        if (!datos) return;

        const solicitud = new sql.Request();

        solicitud.input('id', sql.Int, id);
        solicitud.input('nombre', sql.NVarChar(150), datos.nombre);
        solicitud.input('estado', sql.Bit, datos.estado);
        solicitud.input('slogan', sql.NVarChar(250), datos.slogan);
        solicitud.input('descripcion', sql.NVarChar(500), datos.descripcion);

        const resultado = await solicitud.query(`
            UPDATE dbo.Productora
            SET
                Nombre = @nombre,
                Estado = @estado,
                FechaActualizacion = SYSDATETIME(),
                Slogan = @slogan,
                Descripcion = @descripcion
            OUTPUT
                INSERTED.IdProductora,
                INSERTED.Nombre,
                INSERTED.Estado,
                INSERTED.FechaCreacion,
                INSERTED.FechaActualizacion,
                INSERTED.Slogan,
                INSERTED.Descripcion
            WHERE IdProductora = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Productora no encontrada.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Productora actualizada correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al actualizar productora:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar la productora.'
        });
    }
};


// ============================================================
// 5. ELIMINAR UNA PRODUCTORA
// ============================================================

exports.eliminarProductora = async (req, res) => {
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
            DELETE FROM dbo.Productora
            OUTPUT
                DELETED.IdProductora,
                DELETED.Nombre
            WHERE IdProductora = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Productora no encontrada.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Productora eliminada correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        if (error.number === 547) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar la productora porque esta asociada a una pelicula o serie.'
            });
        }

        console.error('Error al eliminar productora:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar la productora.'
        });
    }
};
