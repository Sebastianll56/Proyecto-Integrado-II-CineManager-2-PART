
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const formularioInicial = {
    serial: '',
    titulo: '',
    sinopsis: '',
    url: '',
    imagenPortada: '',
    anioEstreno: new Date().getFullYear().toString(),
    idGenero: '',
    idDirector: '',
    idProductora: '',
    idTipo: ''
};

function Media() {

    const [medias, setMedias] = useState([]);

    const [catalogos, setCatalogos] = useState({
        generos: [],
        directores: [],
        productoras: [],
        tipos: []
    });

    const [formulario, setFormulario] = useState(formularioInicial);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [idEdicion, setIdEdicion] = useState(null);

    const [cargando, setCargando] = useState(true);

    const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

    const [guardando, setGuardando] = useState(false);

    const [busqueda, setBusqueda] = useState('');

    // =========================================
    // CONSULTAR PELICULAS Y SERIES
    // =========================================

    const cargarMedia = async () => {

        setCargando(true);

        try {

            const respuesta = await api.get('/api/media');

            setMedias(
                Array.isArray(respuesta.data.datos)
                    ? respuesta.data.datos
                    : []
            );

        } catch (error) {

            console.error(
                'Error al consultar películas y series:',
                error
            );

            Swal.fire(
                'Error',
                error.response?.data?.mensaje ||
                'No fue posible consultar las películas y series.',
                'error'
            );

        } finally {

            setCargando(false);

        }

    };

    // =========================================
    // CARGAR CATALOGOS PARA LOS SELECT
    // =========================================

    const cargarCatalogos = async () => {

        setCargandoCatalogos(true);

        try {

            const [
                respuestaGeneros,
                respuestaDirectores,
                respuestaProductoras,
                respuestaTipos
            ] = await Promise.all([

                api.get('/api/generos'),

                api.get('/api/directores'),

                api.get('/api/productoras'),

                api.get('/api/tipos')

            ]);

            setCatalogos({

                generos: respuestaGeneros.data.datos || [],

                directores: respuestaDirectores.data.datos || [],

                productoras: respuestaProductoras.data.datos || [],

                tipos: respuestaTipos.data.datos || []

            });

        } catch (error) {

            console.error(
                'Error al cargar listas de selección:',
                error
            );

            Swal.fire(
                'Error de catálogos',
                'No fue posible cargar todos los datos relacionados. Verifica que la API esté funcionando.',
                'error'
            );

        } finally {

            setCargandoCatalogos(false);

        }

    };

    // =========================================
    // CARGA INICIAL
    // =========================================

    useEffect(() => {

        cargarMedia();

        cargarCatalogos();

    }, []);

    // =========================================
    // ACTUALIZAR CAMPOS DEL FORMULARIO
    // =========================================

    const cambiarCampo = (e) => {

        const { name, value } = e.target;

        setFormulario(anterior => ({
            ...anterior,
            [name]: value
        }));

    };

    // =========================================
    // ABRIR FORMULARIO NUEVO
    // =========================================

    const nuevoRegistro = () => {

        setFormulario(formularioInicial);

        setIdEdicion(null);

        setMostrarFormulario(true);

    };

    // =========================================
    // CERRAR FORMULARIO
    // =========================================

    const cerrarFormulario = () => {

        setMostrarFormulario(false);

        setFormulario(formularioInicial);

        setIdEdicion(null);

    };

    // =========================================
    // EDITAR PELICULA O SERIE
    // =========================================

    const editarRegistro = (media) => {

        setIdEdicion(media.IdMedia);

        setFormulario({

            serial: media.Serial || '',

            titulo: media.Titulo || '',

            sinopsis: media.Sinopsis || '',

            url: media.Url || '',

            imagenPortada: media.ImagenPortada || '',

            anioEstreno: String(media.AnioEstreno || ''),

            idGenero: String(media.IdGenero || ''),

            idDirector: String(media.IdDirector || ''),

            idProductora: String(media.IdProductora || ''),

            idTipo: String(media.IdTipo || '')

        });

        setMostrarFormulario(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    };

    // =========================================
    // VALIDAR FORMULARIO
    // =========================================

    const validarFormulario = () => {

        const obligatorios = [

            formulario.serial,

            formulario.titulo,

            formulario.url,

            formulario.anioEstreno,

            formulario.idGenero,

            formulario.idDirector,

            formulario.idProductora,

            formulario.idTipo

        ];

        if (obligatorios.some(valor => !String(valor).trim())) {

            Swal.fire(
                'Campos obligatorios',
                'Completa todos los campos marcados como obligatorios.',
                'warning'
            );

            return false;

        }

        const anio = Number(formulario.anioEstreno);

        if (
            !Number.isInteger(anio) ||
            anio < 1888 ||
            anio > 2100
        ) {

            Swal.fire(
                'Año inválido',
                'Ingresa un año de estreno válido entre 1888 y 2100.',
                'warning'
            );

            return false;

        }

        if (
            formulario.serial.trim().length > 50 ||
            formulario.titulo.trim().length > 200 ||
            formulario.url.trim().length > 850
        ) {

            Swal.fire(
                'Longitud no válida',
                'Revisa la longitud del serial, título y URL.',
                'warning'
            );

            return false;

        }

        try {

            new URL(formulario.url.trim());

            if (formulario.imagenPortada.trim()) {
                new URL(formulario.imagenPortada.trim());
            }

        } catch {

            Swal.fire(
                'URL inválida',
                'Verifica la dirección URL del contenido y de la imagen de portada.',
                'warning'
            );

            return false;

        }

        return true;

    };

    // =========================================
    // REGISTRAR / ACTUALIZAR
    // =========================================

    const guardarMedia = async (e) => {

        e.preventDefault();

        if (!validarFormulario()) return;

        setGuardando(true);

        try {

            const datos = {

                serial: formulario.serial.trim(),

                titulo: formulario.titulo.trim(),

                sinopsis: formulario.sinopsis.trim() || null,

                url: formulario.url.trim(),

                imagenPortada:
                    formulario.imagenPortada.trim() || null,

                anioEstreno: Number(formulario.anioEstreno),

                idGenero: Number(formulario.idGenero),

                idDirector: Number(formulario.idDirector),

                idProductora: Number(formulario.idProductora),

                idTipo: Number(formulario.idTipo)

            };

            if (idEdicion !== null) {

                await api.put(
                    `/api/media/${idEdicion}`,
                    datos
                );

                await Swal.fire(
                    'Actualizada',
                    'La película o serie fue actualizada correctamente.',
                    'success'
                );

            } else {

                await api.post(
                    '/api/media',
                    datos
                );

                await Swal.fire(
                    'Registrada',
                    'La película o serie fue registrada correctamente.',
                    'success'
                );

            }

            cerrarFormulario();

            await cargarMedia();

        } catch (error) {

            console.error(
                'Error al guardar película o serie:',
                error
            );

            Swal.fire(
                'No se pudo guardar',
                error.response?.data?.mensaje ||
                'Ocurrió un error al guardar el registro. Verifica los datos y las relaciones.',
                'error'
            );

        } finally {

            setGuardando(false);

        }

    };

    // =========================================
    // ELIMINAR PELICULA O SERIE
    // =========================================

    const eliminarMedia = async (media) => {

        const confirmacion = await Swal.fire({

            title: '¿Eliminar registro?',

            text: `Se eliminará "${media.Titulo}".`,

            icon: 'warning',

            showCancelButton: true,

            confirmButtonText: 'Sí, eliminar',

            cancelButtonText: 'Cancelar',

            confirmButtonColor: '#dc3545'

        });

        if (!confirmacion.isConfirmed) return;

        try {

            await api.delete(
                `/api/media/${media.IdMedia}`
            );

            await Swal.fire(
                'Eliminada',
                'La película o serie fue eliminada correctamente.',
                'success'
            );

            await cargarMedia();

        } catch (error) {

            console.error(
                'Error al eliminar registro:',
                error
            );

            Swal.fire(
                'No se pudo eliminar',
                error.response?.data?.mensaje ||
                'No fue posible eliminar el registro.',
                'error'
            );

        }

    };

    // =========================================
    // BUSQUEDA DE REGISTROS
    // =========================================

    const mediasFiltradas = medias.filter(media => {

        const campos = [

            media.Serial,

            media.Titulo,

            media.AnioEstreno,

            media.NombreGenero,

            media.NombreDirector,

            media.NombreProductora,

            media.NombreTipo

        ];

        return campos.some(campo =>

            String(campo || '')
                .toLowerCase()
                .includes(busqueda.toLowerCase())

        );

    });

    // =========================================
    // ESTADISTICAS
    // =========================================

    const totalPeliculas = medias.filter(media =>
        String(media.NombreTipo || '')
            .toLowerCase() === 'película'
    ).length;

    const totalSeries = medias.filter(media =>
        String(media.NombreTipo || '')
            .toLowerCase() === 'serie'
    ).length;

    // =========================================
    // INTERFAZ
    // =========================================

    return (

        <div className="page-content">

            {/* ENCABEZADO */}

            <div className="welcome-section">

                <div>

                    <span className="eyebrow">
                        GESTIÓN DEL CATÁLOGO
                    </span>

                    <h2>
                        Administración de películas y series
                    </h2>

                    <p>
                        Consulta, registra y administra
                        las producciones del catálogo audiovisual.
                    </p>

                </div>

                <button
                    className="btn-refresh"
                    onClick={nuevoRegistro}
                >
                    + Nueva producción
                </button>

            </div>

            {/* ESTADISTICAS */}

            <div
                className="stats-grid"
                style={{
                    gridTemplateColumns:
                    'repeat(3, minmax(200px, 1fr))'
                }}
            >

                <div className="stat-card">

                    <div className="stat-icon blue">
                        ▻
                    </div>

                    <div className="stat-info">

                        <span>
                            Total de producciones
                        </span>

                        <h2>
                            {medias.length}
                        </h2>

                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon purple">
                        ▣
                    </div>

                    <div className="stat-info">

                        <span>
                            Películas
                        </span>

                        <h2>
                            {totalPeliculas}
                        </h2>

                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon green">
                        ▤
                    </div>

                    <div className="stat-info">

                        <span>
                            Series
                        </span>

                        <h2>
                            {totalSeries}
                        </h2>

                    </div>

                </div>

            </div>

            {/* FORMULARIO */}

            {mostrarFormulario && (

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body p-4">

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <h4 className="fw-bold">
                                {idEdicion !== null
                                    ? 'Editar película o serie'
                                    : 'Registrar nueva producción'
                                }
                            </h4>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={cerrarFormulario}
                                aria-label="Cerrar"
                            />

                        </div>

                        {cargandoCatalogos ? (

                            <p className="text-secondary">
                                Cargando catálogos relacionados...
                            </p>

                        ) : (

                            <form onSubmit={guardarMedia}>

                                <div className="row g-3">

                                    {/* SERIAL */}

                                    <div className="col-md-4">

                                        <label className="form-label fw-semibold">
                                            Serial *
                                        </label>

                                        <input
                                            type="text"
                                            name="serial"
                                            className="form-control"
                                            placeholder="Ejemplo: MEDIA-001"
                                            value={formulario.serial}
                                            onChange={cambiarCampo}
                                            maxLength={50}
                                            required
                                        />

                                    </div>

                                    {/* TITULO */}

                                    <div className="col-md-8">

                                        <label className="form-label fw-semibold">
                                            Título *
                                        </label>

                                        <input
                                            type="text"
                                            name="titulo"
                                            className="form-control"
                                            placeholder="Nombre de la producción"
                                            value={formulario.titulo}
                                            onChange={cambiarCampo}
                                            maxLength={200}
                                            required
                                        />

                                    </div>

                                    {/* SINOPSIS */}

                                    <div className="col-12">

                                        <label className="form-label fw-semibold">
                                            Sinopsis
                                        </label>

                                        <textarea
                                            name="sinopsis"
                                            className="form-control"
                                            rows="3"
                                            placeholder="Descripción o sinopsis de la producción..."
                                            value={formulario.sinopsis}
                                            onChange={cambiarCampo}
                                        />

                                    </div>

                                    {/* URL */}

                                    <div className="col-md-6">

                                        <label className="form-label fw-semibold">
                                            URL del contenido *
                                        </label>

                                        <input
                                            type="url"
                                            name="url"
                                            className="form-control"
                                            placeholder="https://ejemplo.com/contenido"
                                            value={formulario.url}
                                            onChange={cambiarCampo}
                                            maxLength={850}
                                            required
                                        />

                                    </div>

                                    {/* IMAGEN */}

                                    <div className="col-md-6">

                                        <label className="form-label fw-semibold">
                                            Imagen de portada
                                        </label>

                                        <input
                                            type="url"
                                            name="imagenPortada"
                                            className="form-control"
                                            placeholder="https://ejemplo.com/portada.jpg"
                                            value={formulario.imagenPortada}
                                            onChange={cambiarCampo}
                                            maxLength={2048}
                                        />

                                    </div>

                                    {/* AÑO */}

                                    <div className="col-md-4">

                                        <label className="form-label fw-semibold">
                                            Año de estreno *
                                        </label>

                                        <input
                                            type="number"
                                            name="anioEstreno"
                                            className="form-control"
                                            min="1888"
                                            max="2100"
                                            value={formulario.anioEstreno}
                                            onChange={cambiarCampo}
                                            required
                                        />

                                    </div>

                                    {/* GENERO */}

                                    <div className="col-md-4">

                                        <label className="form-label fw-semibold">
                                            Género *
                                        </label>

                                        <select
                                            name="idGenero"
                                            className="form-select"
                                            value={formulario.idGenero}
                                            onChange={cambiarCampo}
                                            required
                                        >

                                            <option value="">
                                                Selecciona un género
                                            </option>

                                            {catalogos.generos
                                                .filter(item => item.Estado !== false)
                                                .map(item => (

                                                    <option
                                                        key={item.IdGenero}
                                                        value={item.IdGenero}
                                                    >
                                                        {item.Nombre}
                                                    </option>

                                                ))
                                            }

                                        </select>

                                    </div>

                                    {/* DIRECTOR */}

                                    <div className="col-md-4">

                                        <label className="form-label fw-semibold">
                                            Director *
                                        </label>

                                        <select
                                            name="idDirector"
                                            className="form-select"
                                            value={formulario.idDirector}
                                            onChange={cambiarCampo}
                                            required
                                        >

                                            <option value="">
                                                Selecciona un director
                                            </option>

                                            {catalogos.directores
                                                .filter(item => item.Estado !== false)
                                                .map(item => (

                                                    <option
                                                        key={item.IdDirector}
                                                        value={item.IdDirector}
                                                    >
                                                        {item.Nombres}
                                                    </option>

                                                ))
                                            }

                                        </select>

                                    </div>

                                    {/* PRODUCTORA */}

                                    <div className="col-md-6">

                                        <label className="form-label fw-semibold">
                                            Productora *
                                        </label>

                                        <select
                                            name="idProductora"
                                            className="form-select"
                                            value={formulario.idProductora}
                                            onChange={cambiarCampo}
                                            required
                                        >

                                            <option value="">
                                                Selecciona una productora
                                            </option>

                                            {catalogos.productoras
                                                .filter(item => item.Estado !== false)
                                                .map(item => (

                                                    <option
                                                        key={item.IdProductora}
                                                        value={item.IdProductora}
                                                    >
                                                        {item.Nombre}
                                                    </option>

                                                ))
                                            }

                                        </select>

                                    </div>

                                    {/* TIPO */}

                                    <div className="col-md-6">

                                        <label className="form-label fw-semibold">
                                            Tipo de producción *
                                        </label>

                                        <select
                                            name="idTipo"
                                            className="form-select"
                                            value={formulario.idTipo}
                                            onChange={cambiarCampo}
                                            required
                                        >

                                            <option value="">
                                                Selecciona un tipo
                                            </option>

                                            {catalogos.tipos.map(item => (

                                                <option
                                                    key={item.IdTipo}
                                                    value={item.IdTipo}
                                                >
                                                    {item.Nombre}
                                                </option>

                                            ))}

                                        </select>

                                    </div>

                                </div>

                                {/* BOTONES */}

                                <div className="mt-4">

                                    <button
                                        type="submit"
                                        className="btn btn-primary me-2"
                                        disabled={guardando || cargandoCatalogos}
                                    >

                                        {guardando
                                            ? 'Guardando...'
                                            : idEdicion !== null
                                                ? 'Guardar cambios'
                                                : 'Registrar producción'
                                        }

                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={cerrarFormulario}
                                        disabled={guardando}
                                    >
                                        Cancelar
                                    </button>

                                </div>

                            </form>

                        )}

                    </div>

                </div>

            )}

            {/* LISTADO */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

                        <div>

                            <h4 className="fw-bold mb-1">
                                Listado de películas y series
                            </h4>

                            <small className="text-secondary">
                                Registros almacenados en Neon PostgreSQL.
                            </small>

                        </div>

                        <div className="d-flex gap-2">

                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar producción..."
                                value={busqueda}
                                onChange={e =>
                                    setBusqueda(e.target.value)
                                }
                            />

                            <button
                                className="btn btn-outline-primary"
                                onClick={cargarMedia}
                                disabled={cargando}
                                title="Actualizar listado"
                            >
                                ↻
                            </button>

                        </div>

                    </div>

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-light">

                                <tr>

                                    <th>ID</th>

                                    <th>Serial</th>

                                    <th>Título</th>

                                    <th>Año</th>

                                    <th>Género</th>

                                    <th>Director</th>

                                    <th>Productora</th>

                                    <th>Tipo</th>

                                    <th>Acciones</th>

                                </tr>

                            </thead>

                            <tbody>

                                {cargando ? (

                                    <tr>

                                        <td
                                            colSpan="9"
                                            className="text-center py-5"
                                        >
                                            Cargando producciones...
                                        </td>

                                    </tr>

                                ) : mediasFiltradas.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="9"
                                            className="text-center py-5"
                                        >
                                            No se encontraron películas o series.
                                        </td>

                                    </tr>

                                ) : (

                                    mediasFiltradas.map(media => (

                                        <tr key={media.IdMedia}>

                                            <td>
                                                {media.IdMedia}
                                            </td>

                                            <td>
                                                {media.Serial}
                                            </td>

                                            <td className="fw-semibold">
                                                {media.Titulo}
                                            </td>

                                            <td>
                                                {media.AnioEstreno}
                                            </td>

                                            <td>
                                                {media.NombreGenero || '—'}
                                            </td>

                                            <td>
                                                {media.NombreDirector || '—'}
                                            </td>

                                            <td>
                                                {media.NombreProductora || '—'}
                                            </td>

                                            <td>
                                                <span className="badge bg-primary">
                                                    {media.NombreTipo || '—'}
                                                </span>
                                            </td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            editarRegistro(media)
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            eliminarMedia(media)
                                                        }
                                                    >
                                                        Eliminar
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                    <div className="text-secondary small">

                        Mostrando {mediasFiltradas.length} de {medias.length} producciones.

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Media;
