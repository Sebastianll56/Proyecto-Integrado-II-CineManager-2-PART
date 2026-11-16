
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: TIPO
   CONTROLADOR DE OPERACIONES CRUD
   ============================================================ */

const { sql } = require('../config/database');


// ============================================================
// VALIDAR LOS DATOS DEL TIPO
// ============================================================

function validarDatos(req, res) {
    const { nombre, descripcion } = req.body;

    if (typeof nombre !== 'string' || !nombre.trim()) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre del tipo es obligatorio.'
        });
        return null;
    }

    if (nombre.trim().length > 100) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre no puede superar 100 caracteres.'
        });
        return null;
    }

    if (
        descripcion != null &&
        (
            typeof descripcion !== 'string' ||
            descripcion.length > 500
        )
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'La descripcion no puede superar 500 caracteres.'
        });
        return null;
    }

    return {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null
    };
}


// ============================================================
// 1. CONSULTAR TODOS LOS TIPOS
// ============================================================

exports.listarTipos = async (req, res) => {
    try {
        const resultado = await new sql.Request().query(`
            SELECT
                IdTipo,
                Nombre,
                FechaCreacion,
                FechaActualizacion,
                Descripcion
            FROM dbo.Tipo
            ORDER BY IdTipo ASC;
        `);

        return res.status(200).json({
            ok: true,
            total: resultado.recordset.length,
            datos: resultado.recordset
        });

    } catch (error) {
        console.error('Error al consultar tipos:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar los tipos.'
        });
    }
};


// ============================================================
// 2. CONSULTAR UN TIPO POR ID
// ============================================================

exports.obtenerTipo = async (req, res) => {
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
                IdTipo,
                Nombre,
                FechaCreacion,
                FechaActualizacion,
                Descripcion
            FROM dbo.Tipo
            WHERE IdTipo = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Tipo no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al obtener tipo:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar el tipo.'
        });
    }
};


// ============================================================
// 3. REGISTRAR UN TIPO
// ============================================================

exports.crearTipo = async (req, res) => {
    try {
        const datos = validarDatos(req, res);

        if (!datos) return;

        const solicitud = new sql.Request();

        solicitud.input(
            'nombre',
            sql.NVarChar(100),
            datos.nombre
        );

        solicitud.input(
            'descripcion',
            sql.NVarChar(500),
            datos.descripcion
        );

        const resultado = await solicitud.query(`
            INSERT INTO dbo.Tipo
                (
                    Nombre,
                    FechaCreacion,
                    FechaActualizacion,
                    Descripcion
                )
            OUTPUT
                INSERTED.IdTipo,
                INSERTED.Nombre,
                INSERTED.FechaCreacion,
                INSERTED.FechaActualizacion,
                INSERTED.Descripcion
            VALUES
                (
                    @nombre,
                    SYSDATETIME(),
                    NULL,
                    @descripcion
                );
        `);

        return res.status(201).json({
            ok: true,
            mensaje: 'Tipo registrado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al registrar tipo:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al registrar el tipo.'
        });
    }
};


// ============================================================
// 4. ACTUALIZAR UN TIPO
// ============================================================

exports.actualizarTipo = async (req, res) => {
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

        solicitud.input(
            'nombre',
            sql.NVarChar(100),
            datos.nombre
        );

        solicitud.input(
            'descripcion',
            sql.NVarChar(500),
            datos.descripcion
        );

        const resultado = await solicitud.query(`
            UPDATE dbo.Tipo
            SET
                Nombre = @nombre,
                FechaActualizacion = SYSDATETIME(),
                Descripcion = @descripcion
            OUTPUT
                INSERTED.IdTipo,
                INSERTED.Nombre,
                INSERTED.FechaCreacion,
                INSERTED.FechaActualizacion,
                INSERTED.Descripcion
            WHERE IdTipo = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Tipo no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Tipo actualizado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        console.error('Error al actualizar tipo:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar el tipo.'
        });
    }
};


// ============================================================
// 5. ELIMINAR UN TIPO
// ============================================================

exports.eliminarTipo = async (req, res) => {
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
            DELETE FROM dbo.Tipo
            OUTPUT
                DELETED.IdTipo,
                DELETED.Nombre
            WHERE IdTipo = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Tipo no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Tipo eliminado correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        if (error.number === 547) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar el tipo porque esta asociado a una pelicula o serie.'
            });
        }

        console.error('Error al eliminar tipo:', error.message);

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar el tipo.'
        });
    }
};
