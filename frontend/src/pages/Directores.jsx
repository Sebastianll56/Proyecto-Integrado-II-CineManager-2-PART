
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const formularioInicial = {
    nombres: '',
    estado: true
};

function Directores() {
    const [directores, setDirectores] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // =========================================
    // CONSULTAR DIRECTORES
    // =========================================

    const cargarDirectores = async () => {
        setCargando(true);

        try {
            const respuesta = await api.get('/api/directores');

            setDirectores(
                Array.isArray(respuesta.data.datos)
                    ? respuesta.data.datos
                    : []
            );

        } catch (error) {
            console.error('Error al consultar directores:', error);

            Swal.fire(
                'Error',
                error.response?.data?.mensaje ||
                'No fue posible consultar los directores.',
                'error'
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDirectores();
    }, []);

    // =========================================
    // NUEVO DIRECTOR
    // =========================================

    const nuevoDirector = () => {
        setFormulario(formularioInicial);
        setIdEdicion(null);
        setMostrarFormulario(true);
    };

    // =========================================
    // EDITAR DIRECTOR
    // =========================================

    const editarDirector = (director) => {
        setIdEdicion(director.IdDirector);

        setFormulario({
            nombres: director.Nombres || '',
            estado: Boolean(director.Estado)
        });

        setMostrarFormulario(true);
    };

    // =========================================
    // GUARDAR DIRECTOR
    // =========================================

    const guardarDirector = async (e) => {
        e.preventDefault();

        if (!formulario.nombres.trim()) {
            Swal.fire(
                'Campo obligatorio',
                'Debes ingresar el nombre del director.',
                'warning'
            );
            return;
        }

        setGuardando(true);

        try {
            const datos = {
                nombres: formulario.nombres.trim(),
                estado: formulario.estado
            };

            if (idEdicion !== null) {

                await api.put(
                    `/api/directores/${idEdicion}`,
                    datos
                );

                await Swal.fire(
                    'Actualizado',
                    'El director fue actualizado correctamente.',
                    'success'
                );

            } else {

                await api.post('/api/directores', datos);

                await Swal.fire(
                    'Registrado',
                    'El director fue registrado correctamente.',
                    'success'
                );
            }

            setMostrarFormulario(false);
            setFormulario(formularioInicial);
            setIdEdicion(null);

            await cargarDirectores();

        } catch (error) {
            console.error('Error al guardar director:', error);

            Swal.fire(
                'No se pudo guardar',
                error.response?.data?.mensaje ||
                'Ocurrió un error al guardar el director.',
                'error'
            );
        } finally {
            setGuardando(false);
        }
    };

    // =========================================
    // ELIMINAR DIRECTOR
    // =========================================

    const eliminarDirector = async (director) => {

        const confirmacion = await Swal.fire({
            title: '¿Eliminar director?',
            text: `Se eliminará "${director.Nombres}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545'
        });

        if (!confirmacion.isConfirmed) return;

        try {
            await api.delete(
                `/api/directores/${director.IdDirector}`
            );

            await Swal.fire(
                'Eliminado',
                'El director fue eliminado correctamente.',
                'success'
            );

            await cargarDirectores();

        } catch (error) {
            console.error('Error al eliminar director:', error);

            Swal.fire(
                'No se pudo eliminar',
                error.response?.data?.mensaje ||
                'No fue posible eliminar el director. Verifica si tiene películas relacionadas.',
                'error'
            );
        }
    };

    // =========================================
    // BUSQUEDA
    // =========================================

    const directoresFiltrados = directores.filter(
        director =>
            director.Nombres?.toLowerCase().includes(
                busqueda.toLowerCase()
            )
    );

    // =========================================
    // INTERFAZ
    // =========================================

    return (
        <div className="page-content">

            <div className="welcome-section">
                <div>
                    <span className="eyebrow">
                        GESTIÓN DEL CATÁLOGO
                    </span>

                    <h2>Administración de directores</h2>

                    <p>
                        Consulta, registra y administra los
                        directores del catálogo audiovisual.
                    </p>
                </div>

                <button
                    className="btn-refresh"
                    onClick={nuevoDirector}
                >
                    + Nuevo director
                </button>
            </div>

            {/* ESTADISTICAS */}

            <div
                className="stats-grid"
                style={{
                    gridTemplateColumns:
                        'repeat(3, minmax(0, 1fr))'
                }}
            >
                <div className="stat-card">
                    <div className="stat-icon blue">♙</div>

                    <div className="stat-info">
                        <span>Total de directores</span>
                        <h2>{directores.length}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">✓</div>

                    <div className="stat-info">
                        <span>Directores activos</span>
                        <h2>
                            {directores.filter(
                                d => d.Estado
                            ).length}
                        </h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">○</div>

                    <div className="stat-info">
                        <span>Directores inactivos</span>
                        <h2>
                            {directores.filter(
                                d => !d.Estado
                            ).length}
                        </h2>
                    </div>
                </div>
            </div>

            {/* FORMULARIO */}

            {mostrarFormulario && (
                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body p-4">

                        <div className="d-flex justify-content-between mb-4">

                            <h5 className="fw-bold">
                                {idEdicion !== null
                                    ? 'Editar director'
                                    : 'Registrar nuevo director'}
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

                        <form onSubmit={guardarDirector}>

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Nombre del director *
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ejemplo: Christopher Nolan"
                                    value={formulario.nombres}
                                    maxLength={150}
                                    onChange={e =>
                                        setFormulario({
                                            ...formulario,
                                            nombres: e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>

                            <div className="form-check form-switch mb-4">

                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="estadoDirector"
                                    checked={formulario.estado}
                                    onChange={e =>
                                        setFormulario({
                                            ...formulario,
                                            estado: e.target.checked
                                        })
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="estadoDirector"
                                >
                                    Director activo
                                </label>

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
                                        : 'Registrar director'}
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

                    <div className="d-flex justify-content-between
                        align-items-center flex-wrap gap-3 mb-4">

                        <div>
                            <h5 className="fw-bold mb-1">
                                Listado de directores
                            </h5>

                            <small className="text-secondary">
                                Registros almacenados en SQL Server.
                            </small>
                        </div>

                        <div className="d-flex gap-2">

                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar director..."
                                value={busqueda}
                                onChange={e =>
                                    setBusqueda(e.target.value)
                                }
                            />

                            <button
                                className="btn btn-outline-primary"
                                onClick={cargarDirectores}
                                disabled={cargando}
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
                                    <th>Nombre del director</th>
                                    <th>Estado</th>
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
                                            Cargando directores...
                                        </td>
                                    </tr>

                                ) : directoresFiltrados.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="text-center py-5"
                                        >
                                            No se encontraron directores.
                                        </td>
                                    </tr>

                                ) : (

                                    directoresFiltrados.map(director => (

                                        <tr key={director.IdDirector}>

                                            <td>
                                                {director.IdDirector}
                                            </td>

                                            <td className="fw-semibold">
                                                {director.Nombres}
                                            </td>

                                            <td>

                                                <span
                                                    className={`badge ${
                                                        director.Estado
                                                            ? 'bg-success'
                                                            : 'bg-secondary'
                                                    }`}
                                                >
                                                    {director.Estado
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>

                                            </td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            editarDirector(director)
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            eliminarDirector(director)
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
                        Mostrando {directoresFiltrados.length} de {directores.length} directores.
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Directores;
