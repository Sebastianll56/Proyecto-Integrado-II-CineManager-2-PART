
/* ============================================================
   PROYECTO INTEGRADO 2
   MODULO: MEDIA
   GESTION DE PELICULAS Y SERIES
   CONTROLADOR DE OPERACIONES CRUD
   ============================================================ */

const { sql } = require('../config/database');


// ============================================================
// CONSULTA CON INFORMACION DE LAS TABLAS RELACIONADAS
// ============================================================

const consultaMedia = `
    SELECT
        m.IdMedia,
        m.Serial,
        m.Titulo,
        m.Sinopsis,
        m.Url,
        m.ImagenPortada,
        m.FechaCreacion,
        m.FechaActualizacion,
        m.AnioEstreno,

        m.IdGenero,
        g.Nombre AS NombreGenero,

        m.IdDirector,
        d.Nombres AS NombreDirector,

        m.IdProductora,
        p.Nombre AS NombreProductora,

        m.IdTipo,
        t.Nombre AS NombreTipo

    FROM dbo.Media m

    INNER JOIN dbo.Genero g
        ON m.IdGenero = g.IdGenero

    INNER JOIN dbo.Director d
        ON m.IdDirector = d.IdDirector

    INNER JOIN dbo.Productora p
        ON m.IdProductora = p.IdProductora

    INNER JOIN dbo.Tipo t
        ON m.IdTipo = t.IdTipo
`;


// ============================================================
// VALIDAR LOS DATOS DE PELICULAS Y SERIES
// ============================================================

function validarDatos(req, res) {

    const {
        serial,
        titulo,
        sinopsis,
        url,
        imagenPortada,
        anioEstreno,
        idGenero,
        idDirector,
        idProductora,
        idTipo
    } = req.body;

    // Validar Serial
    if (
        typeof serial !== 'string' ||
        serial.trim() === '' ||
        serial.trim().length > 50
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'El serial es obligatorio y no puede superar 50 caracteres.'
        });

        return null;
    }

    // Validar titulo
    if (
        typeof titulo !== 'string' ||
        titulo.trim() === '' ||
        titulo.trim().length > 200
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'El titulo es obligatorio y no puede superar 200 caracteres.'
        });

        return null;
    }

    // Validar sinopsis opcional
    if (
        sinopsis != null &&
        typeof sinopsis !== 'string'
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'La sinopsis debe ser un texto valido.'
        });

        return null;
    }

    // Validar URL
    if (
        typeof url !== 'string' ||
        url.trim() === '' ||
        url.trim().length > 850
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'La URL es obligatoria y no puede superar 850 caracteres.'
        });

        return null;
    }

    // Validar imagen de portada opcional
    if (
        imagenPortada != null &&
        (
            typeof imagenPortada !== 'string' ||
            imagenPortada.length > 2048
        )
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'La imagen de portada no puede superar 2048 caracteres.'
        });

        return null;
    }

    // Validar año de estreno
    const anio = Number(anioEstreno);

    if (
        !Number.isInteger(anio) ||
        anio < 1 ||
        anio > 32767
    ) {
        res.status(400).json({
            ok: false,
            mensaje: 'El año de estreno debe ser un entero valido para SQL Server.'
        });

        return null;
    }

    // Validar llaves foraneas
    const referencias = [
        idGenero,
        idDirector,
        idProductora,
        idTipo
    ];

    const idsValidos = referencias.every(id =>
        Number.isInteger(Number(id)) &&
        Number(id) > 0
    );

    if (!idsValidos) {
        res.status(400).json({
            ok: false,
            mensaje: 'Genero, director, productora y tipo son obligatorios y deben tener IDs validos.'
        });

        return null;
    }

    return {
        serial: serial.trim(),
        titulo: titulo.trim(),
        sinopsis: sinopsis ?? null,
        url: url.trim(),
        imagenPortada: imagenPortada?.trim() || null,
        anioEstreno: anio,
        idGenero: Number(idGenero),
        idDirector: Number(idDirector),
        idProductora: Number(idProductora),
        idTipo: Number(idTipo)
    };
}


// ============================================================
// FUNCION PARA AGREGAR PARAMETROS SQL
// ============================================================

function agregarParametros(solicitud, datos) {

    solicitud.input(
        'serial',
        sql.NVarChar(50),
        datos.serial
    );

    solicitud.input(
        'titulo',
        sql.NVarChar(200),
        datos.titulo
    );

    solicitud.input(
        'sinopsis',
        sql.NVarChar(sql.MAX),
        datos.sinopsis
    );

    solicitud.input(
        'url',
        sql.NVarChar(850),
        datos.url
    );

    solicitud.input(
        'imagenPortada',
        sql.NVarChar(2048),
        datos.imagenPortada
    );

    solicitud.input(
        'anioEstreno',
        sql.SmallInt,
        datos.anioEstreno
    );

    solicitud.input(
        'idGenero',
        sql.Int,
        datos.idGenero
    );

    solicitud.input(
        'idDirector',
        sql.Int,
        datos.idDirector
    );

    solicitud.input(
        'idProductora',
        sql.Int,
        datos.idProductora
    );

    solicitud.input(
        'idTipo',
        sql.Int,
        datos.idTipo
    );

}


// ============================================================
// FUNCION PARA OBTENER LOS REGISTROS RELACIONADOS
// ============================================================

function responderError(res, error, operacion) {

    console.error(`Error al ${operacion} media:`, error.message);

    // Error por relacion con otra tabla
    if (error.number === 547) {
        return res.status(409).json({
            ok: false,
            mensaje: 'Una de las referencias a genero, director, productora o tipo no existe, o el registro esta relacionado con otros datos.'
        });
    }

    // Error por valor duplicado
    if (error.number === 2601 || error.number === 2627) {
        return res.status(409).json({
            ok: false,
            mensaje: 'La URL o el identificador ya se encuentra registrado.'
        });
    }

    return res.status(500).json({
        ok: false,
        mensaje: `Error al ${operacion} la pelicula o serie.`
    });
}


// ============================================================
// 1. CONSULTAR TODAS LAS PELICULAS Y SERIES
// ============================================================

exports.listarMedia = async (req, res) => {

    try {

        const resultado = await new sql.Request().query(`
            ${consultaMedia}
            ORDER BY m.IdMedia ASC;
        `);

        return res.status(200).json({
            ok: true,
            total: resultado.recordset.length,
            datos: resultado.recordset
        });

    } catch (error) {

        return responderError(
            res,
            error,
            'consultar'
        );

    }

};


// ============================================================
// 2. CONSULTAR UNA PELICULA O SERIE POR ID
// ============================================================

exports.obtenerMedia = async (req, res) => {

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
            ${consultaMedia}
            WHERE m.IdMedia = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Pelicula o serie no encontrada.'
            });
        }

        return res.status(200).json({
            ok: true,
            datos: resultado.recordset[0]
        });

    } catch (error) {

        return responderError(
            res,
            error,
            'consultar'
        );

    }

};


// ============================================================
// 3. REGISTRAR UNA PELICULA O SERIE
// ============================================================

exports.crearMedia = async (req, res) => {

    try {

        const datos = validarDatos(req, res);

        if (!datos) return;

        const solicitud = new sql.Request();

        agregarParametros(solicitud, datos);

        const resultado = await solicitud.query(`
            INSERT INTO dbo.Media
            (
                Serial,
                Titulo,
                Sinopsis,
                Url,
                ImagenPortada,
                FechaCreacion,
                FechaActualizacion,
                AnioEstreno,
                IdGenero,
                IdDirector,
                IdProductora,
                IdTipo
            )
            OUTPUT INSERTED.IdMedia
            VALUES
            (
                @serial,
                @titulo,
                @sinopsis,
                @url,
                @imagenPortada,
                SYSDATETIME(),
                NULL,
                @anioEstreno,
                @idGenero,
                @idDirector,
                @idProductora,
                @idTipo
            );
        `);

        const nuevoId = resultado.recordset[0].IdMedia;

        // Recuperar el registro con sus relaciones
        const consulta = new sql.Request();

        consulta.input('id', sql.Int, nuevoId);

        const registro = await consulta.query(`
            ${consultaMedia}
            WHERE m.IdMedia = @id;
        `);

        return res.status(201).json({
            ok: true,
            mensaje: 'Pelicula o serie registrada correctamente.',
            datos: registro.recordset[0]
        });

    } catch (error) {

        return responderError(
            res,
            error,
            'registrar'
        );

    }

};


// ============================================================
// 4. ACTUALIZAR UNA PELICULA O SERIE
// ============================================================

exports.actualizarMedia = async (req, res) => {

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

        agregarParametros(solicitud, datos);

        const resultado = await solicitud.query(`
            UPDATE dbo.Media
            SET
                Serial = @serial,
                Titulo = @titulo,
                Sinopsis = @sinopsis,
                Url = @url,
                ImagenPortada = @imagenPortada,
                AnioEstreno = @anioEstreno,
                IdGenero = @idGenero,
                IdDirector = @idDirector,
                IdProductora = @idProductora,
                IdTipo = @idTipo,
                FechaActualizacion = SYSDATETIME()
            OUTPUT INSERTED.IdMedia
            WHERE IdMedia = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Pelicula o serie no encontrada.'
            });
        }

        // Recuperar los datos actualizados
        const consulta = new sql.Request();

        consulta.input('id', sql.Int, id);

        const registro = await consulta.query(`
            ${consultaMedia}
            WHERE m.IdMedia = @id;
        `);

        return res.status(200).json({
            ok: true,
            mensaje: 'Pelicula o serie actualizada correctamente.',
            datos: registro.recordset[0]
        });

    } catch (error) {

        return responderError(
            res,
            error,
            'actualizar'
        );

    }

};


// ============================================================
// 5. ELIMINAR UNA PELICULA O SERIE
// ============================================================

exports.eliminarMedia = async (req, res) => {

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
            DELETE FROM dbo.Media
            OUTPUT
                DELETED.IdMedia,
                DELETED.Titulo,
                DELETED.Serial
            WHERE IdMedia = @id;
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Pelicula o serie no encontrada.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Pelicula o serie eliminada correctamente.',
            datos: resultado.recordset[0]
        });

    } catch (error) {

        return responderError(
            res,
            error,
            'eliminar'
        );

    }

};
