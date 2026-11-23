
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const formularioInicial = {
    nombre: '',
    descripcion: ''
};

function Tipos() {

    const [tipos, setTipos] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // =========================================
    // CONSULTAR TIPOS
    // =========================================

    const cargarTipos = async () => {

        setCargando(true);

        try {

            const respuesta = await api.get('/api/tipos');

            setTipos(
                Array.isArray(respuesta.data.datos)
                    ? respuesta.data.datos
                    : []
            );

        } catch (error) {

            console.error('Error al consultar tipos:', error);

            Swal.fire(
                'Error',
                error.response?.data?.mensaje ||
                'No fue posible consultar los tipos.',
                'error'
            );

        } finally {

            setCargando(false);

        }
    };

    useEffect(() => {
        cargarTipos();
    }, []);

    // =========================================
    // NUEVO TIPO
    // =========================================

    const nuevoTipo = () => {

        setFormulario(formularioInicial);
        setIdEdicion(null);
        setMostrarFormulario(true);

    };

    // =========================================
    // EDITAR TIPO
    // =========================================

    const editarTipo = (tipo) => {

        setIdEdicion(tipo.IdTipo);

        setFormulario({
            nombre: tipo.Nombre || '',
            descripcion: tipo.Descripcion || ''
        });

        setMostrarFormulario(true);

    };

    // =========================================
    // REGISTRAR / ACTUALIZAR
    // =========================================

    const guardarTipo = async (e) => {

        e.preventDefault();

        if (!formulario.nombre.trim()) {

            Swal.fire(
                'Campo obligatorio',
                'Debes ingresar el nombre del tipo.',
                'warning'
            );

            return;
        }

        setGuardando(true);

        try {

            const datos = {
                nombre: formulario.nombre.trim(),
                descripcion: formulario.descripcion.trim() || null
            };

            if (idEdicion !== null) {

                await api.put(
                    `/api/tipos/${idEdicion}`,
                    datos
                );

                await Swal.fire(
                    'Actualizado',
                    'El tipo fue actualizado correctamente.',
                    'success'
                );

            } else {

                await api.post(
                    '/api/tipos',
                    datos
                );

                await Swal.fire(
                    'Registrado',
                    'El tipo fue registrado correctamente.',
                    'success'
                );

            }

            setMostrarFormulario(false);
            setFormulario(formularioInicial);
            setIdEdicion(null);

            await cargarTipos();

        } catch (error) {

            console.error('Error al guardar tipo:', error);

            Swal.fire(
                'No se pudo guardar',
                error.response?.data?.mensaje ||
                'Ocurrió un error al guardar el tipo.',
                'error'
            );

        } finally {

            setGuardando(false);

        }

    };

    // =========================================
    // ELIMINAR TIPO
    // =========================================

    const eliminarTipo = async (tipo) => {

        const confirmacion = await Swal.fire({

            title: '¿Eliminar tipo?',

            text: `Se eliminará "${tipo.Nombre}".`,

            icon: 'warning',

            showCancelButton: true,

            confirmButtonText: 'Sí, eliminar',

            cancelButtonText: 'Cancelar',

            confirmButtonColor: '#dc3545'

        });

        if (!confirmacion.isConfirmed) return;

        try {

            await api.delete(
                `/api/tipos/${tipo.IdTipo}`
            );

            await Swal.fire(
                'Eliminado',
                'El tipo fue eliminado correctamente.',
                'success'
            );

            await cargarTipos();

        } catch (error) {

            console.error('Error al eliminar tipo:', error);

            Swal.fire(
                'No se pudo eliminar',
                error.response?.data?.mensaje ||
                'No fue posible eliminar el tipo. Verifica si tiene películas o series relacionadas.',
                'error'
            );

        }

    };

    // =========================================
    // BUSQUEDA
    // =========================================

    const tiposFiltrados = tipos.filter(tipo => {

        const nombre = tipo.Nombre || '';
        const descripcion = tipo.Descripcion || '';

        const termino = busqueda.toLowerCase();

        return (
            nombre.toLowerCase().includes(termino) ||
            descripcion.toLowerCase().includes(termino)
        );

    });

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
                        Administración de tipos
                    </h2>

                    <p>
                        Consulta, registra y administra
                        los tipos de producciones audiovisuales.
                    </p>

                </div>

                <button
                    className="btn-refresh"
                    onClick={nuevoTipo}
                >
                    + Nuevo tipo
                </button>

            </div>

            {/* ESTADISTICAS */}

            <div
                className="stats-grid"
                style={{
                    gridTemplateColumns:
                    'repeat(1, minmax(220px, 320px))'
                }}
            >

                <div className="stat-card">

                    <div className="stat-icon blue">
                        ▤
                    </div>

                    <div className="stat-info">

                        <span>
                            Total de tipos
                        </span>

                        <h2>
                            {tipos.length}
                        </h2>

                    </div>

                </div>

            </div>

            {/* FORMULARIO */}

            {mostrarFormulario && (

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body p-4">

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <h5 className="fw-bold">
                                {idEdicion !== null
                                    ? 'Editar tipo'
                                    : 'Registrar nuevo tipo'
                                }
                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={() =>
                                    setMostrarFormulario(false)
                                }
                                aria-label="Cerrar"
                            />

                        </div>

                        <form onSubmit={guardarTipo}>

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Nombre del tipo *
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ejemplo: Película o Serie"
                                    value={formulario.nombre}
                                    maxLength={100}
                                    required
                                    onChange={e =>
                                        setFormulario({
                                            ...formulario,
                                            nombre: e.target.value
                                        })
                                    }
                                />

                            </div>

                            <div className="mb-4">

                                <label className="form-label fw-semibold">
                                    Descripción
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Descripción del tipo de producción..."
                                    value={formulario.descripcion}
                                    maxLength={500}
                                    onChange={e =>
                                        setFormulario({
                                            ...formulario,
                                            descripcion: e.target.value
                                        })
                                    }
                                />

                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary me-2"
                                disabled={guardando}
                            >

                                {guardando
                                    ? 'Guardando...'
                                    : idEdicion !== null
                                        ? 'Guardar cambios'
                                        : 'Registrar tipo'
                                }

                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    setMostrarFormulario(false)
                                }
                                disabled={guardando}
                            >
                                Cancelar
                            </button>

                        </form>

                    </div>

                </div>

            )}

            {/* LISTADO */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

                        <div>

                            <h5 className="fw-bold mb-1">
                                Listado de tipos
                            </h5>

                            <small className="text-secondary">
                                Registros almacenados en Neon PostgreSQL.
                            </small>

                        </div>

                        <div className="d-flex gap-2">

                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar tipo..."
                                value={busqueda}
                                onChange={e =>
                                    setBusqueda(e.target.value)
                                }
                            />

                            <button
                                className="btn btn-outline-primary"
                                onClick={cargarTipos}
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
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>

                            </thead>

                            <tbody>

                                {cargando ? (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="text-center py-5"
                                        >
                                            Cargando tipos...
                                        </td>

                                    </tr>

                                ) : tiposFiltrados.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="text-center py-5"
                                        >
                                            No se encontraron tipos.
                                        </td>

                                    </tr>

                                ) : (

                                    tiposFiltrados.map(tipo => (

                                        <tr key={tipo.IdTipo}>

                                            <td>
                                                {tipo.IdTipo}
                                            </td>

                                            <td className="fw-semibold">
                                                {tipo.Nombre}
                                            </td>

                                            <td>
                                                {tipo.Descripcion || 'Sin descripción'}
                                            </td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            editarTipo(tipo)
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            eliminarTipo(tipo)
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

                        Mostrando {tiposFiltrados.length} de {tipos.length} tipos.

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Tipos;
