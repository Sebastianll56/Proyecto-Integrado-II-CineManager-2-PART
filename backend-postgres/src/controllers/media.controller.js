const { pool } = require('../config/database');

const consultaMedia = `
    SELECT
        m.idmedia AS "IdMedia",
        m.serial AS "Serial",
        m.titulo AS "Titulo",
        m.sinopsis AS "Sinopsis",
        m.url AS "Url",
        m.imagenportada AS "ImagenPortada",
        m.fechacreacion AS "FechaCreacion",
        m.fechaactualizacion AS "FechaActualizacion",
        m.anioestreno AS "AnioEstreno",
        m.idgenero AS "IdGenero",
        g.nombre AS "NombreGenero",
        m.iddirector AS "IdDirector",
        d.nombres AS "NombreDirector",
        m.idproductora AS "IdProductora",
        p.nombre AS "NombreProductora",
        m.idtipo AS "IdTipo",
        t.nombre AS "NombreTipo"
    FROM media m
    INNER JOIN genero g ON m.idgenero = g.idgenero
    INNER JOIN director d ON m.iddirector = d.iddirector
    INNER JOIN productora p ON m.idproductora = p.idproductora
    INNER JOIN tipo t ON m.idtipo = t.idtipo
`;

function validarId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function validarDatos(body) {
    const {
        serial, titulo, sinopsis, url, imagenPortada, anioEstreno,
        idGenero, idDirector, idProductora, idTipo
    } = body;

    if (typeof serial !== 'string' || !serial.trim() || serial.trim().length > 50) {
        return { error: 'El serial es obligatorio y no puede superar 50 caracteres.' };
    }
    if (typeof titulo !== 'string' || !titulo.trim() || titulo.trim().length > 200) {
        return { error: 'El título es obligatorio y no puede superar 200 caracteres.' };
    }
    if (sinopsis != null && typeof sinopsis !== 'string') {
        return { error: 'La sinopsis debe ser un texto válido.' };
    }
    if (typeof url !== 'string' || !url.trim() || url.trim().length > 850) {
        return { error: 'La URL es obligatoria y no puede superar 850 caracteres.' };
    }
    if (imagenPortada != null && (typeof imagenPortada !== 'string' || imagenPortada.length > 2048)) {
        return { error: 'La imagen de portada no puede superar 2048 caracteres.' };
    }

    const anio = Number(anioEstreno);
    if (!Number.isInteger(anio) || anio < 1 || anio > 32767) {
        return { error: 'El año de estreno debe ser un entero válido.' };
    }

    const ids = [idGenero, idDirector, idProductora, idTipo].map(Number);
    if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
        return { error: 'Género, director, productora y tipo son obligatorios y deben tener IDs válidos.' };
    }

    return {
        datos: {
            serial: serial.trim(),
            titulo: titulo.trim(),
            sinopsis: sinopsis ?? null,
            url: url.trim(),
            imagenPortada: imagenPortada?.trim() || null,
            anioEstreno: anio,
            idGenero: ids[0],
            idDirector: ids[1],
            idProductora: ids[2],
            idTipo: ids[3]
        }
    };
}

async function validarReferenciasActivas(datos) {
    const consulta = await pool.query(
        `SELECT
            g.estado AS genero_activo,
            d.estado AS director_activo,
            p.estado AS productora_activa,
            t.idtipo AS tipo_existente
         FROM genero g
         CROSS JOIN director d
         CROSS JOIN productora p
         CROSS JOIN tipo t
         WHERE g.idgenero = $1
           AND d.iddirector = $2
           AND p.idproductora = $3
           AND t.idtipo = $4`,
        [datos.idGenero, datos.idDirector, datos.idProductora, datos.idTipo]
    );

    if (!consulta.rows.length) {
        return 'Una de las referencias seleccionadas no existe.';
    }
    const fila = consulta.rows[0];
    if (!fila.genero_activo || !fila.director_activo || !fila.productora_activa) {
        return 'El género, director y productora asociados deben estar activos.';
    }
    return null;
}

function responderError(res, error, operacion) {
    console.error(`Error al ${operacion} media:`, error.message);
    if (error.code === '23503') {
        return res.status(409).json({ ok: false, mensaje: 'Una de las referencias a género, director, productora o tipo no existe, o el registro está relacionado con otros datos.' });
    }
    if (error.code === '23505') {
        return res.status(409).json({ ok: false, mensaje: 'El serial o la URL ya se encuentra registrado.' });
    }
    return res.status(500).json({ ok: false, mensaje: `Error al ${operacion} la película o serie.` });
}

exports.listarMedia = async (req, res) => {
    try {
        const { rows } = await pool.query(`${consultaMedia} ORDER BY m.idmedia ASC`);
        return res.status(200).json({ ok: true, total: rows.length, datos: rows });
    } catch (error) {
        return responderError(res, error, 'consultar');
    }
};

exports.obtenerMedia = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID debe ser un entero positivo.' });
    try {
        const { rows } = await pool.query(`${consultaMedia} WHERE m.idmedia = $1`, [id]);
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Película o serie no encontrada.' });
        return res.status(200).json({ ok: true, datos: rows[0] });
    } catch (error) {
        return responderError(res, error, 'consultar');
    }
};

exports.crearMedia = async (req, res) => {
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const datos = validacion.datos;

    try {
        const errorReferencia = await validarReferenciasActivas(datos);
        if (errorReferencia) return res.status(400).json({ ok: false, mensaje: errorReferencia });

        const insercion = await pool.query(
            `INSERT INTO media
                (serial, titulo, sinopsis, url, imagenportada, anioestreno,
                 idgenero, iddirector, idproductora, idtipo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING idmedia`,
            [
                datos.serial, datos.titulo, datos.sinopsis, datos.url,
                datos.imagenPortada, datos.anioEstreno, datos.idGenero,
                datos.idDirector, datos.idProductora, datos.idTipo
            ]
        );

        const { rows } = await pool.query(`${consultaMedia} WHERE m.idmedia = $1`, [insercion.rows[0].idmedia]);
        return res.status(201).json({ ok: true, mensaje: 'Película o serie registrada correctamente.', datos: rows[0] });
    } catch (error) {
        return responderError(res, error, 'registrar');
    }
};

exports.actualizarMedia = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    const validacion = validarDatos(req.body);
    if (validacion.error) return res.status(400).json({ ok: false, mensaje: validacion.error });
    const datos = validacion.datos;

    try {
        const errorReferencia = await validarReferenciasActivas(datos);
        if (errorReferencia) return res.status(400).json({ ok: false, mensaje: errorReferencia });

        const actualizacion = await pool.query(
            `UPDATE media SET
                serial = $1,
                titulo = $2,
                sinopsis = $3,
                url = $4,
                imagenportada = $5,
                anioestreno = $6,
                idgenero = $7,
                iddirector = $8,
                idproductora = $9,
                idtipo = $10,
                fechaactualizacion = CURRENT_TIMESTAMP
             WHERE idmedia = $11
             RETURNING idmedia`,
            [
                datos.serial, datos.titulo, datos.sinopsis, datos.url,
                datos.imagenPortada, datos.anioEstreno, datos.idGenero,
                datos.idDirector, datos.idProductora, datos.idTipo, id
            ]
        );

        if (!actualizacion.rows.length) return res.status(404).json({ ok: false, mensaje: 'Película o serie no encontrada.' });
        const { rows } = await pool.query(`${consultaMedia} WHERE m.idmedia = $1`, [id]);
        return res.status(200).json({ ok: true, mensaje: 'Película o serie actualizada correctamente.', datos: rows[0] });
    } catch (error) {
        return responderError(res, error, 'actualizar');
    }
};

exports.eliminarMedia = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, mensaje: 'El ID no es válido.' });
    try {
        const { rows } = await pool.query(
            'DELETE FROM media WHERE idmedia = $1 RETURNING idmedia AS "IdMedia", titulo AS "Titulo", serial AS "Serial"',
            [id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Película o serie no encontrada.' });
        return res.status(200).json({ ok: true, mensaje: 'Película o serie eliminada correctamente.', datos: rows[0] });
    } catch (error) {
        return responderError(res, error, 'eliminar');
    }
};
