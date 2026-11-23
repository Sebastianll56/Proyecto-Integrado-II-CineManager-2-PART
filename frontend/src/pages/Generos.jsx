
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const formularioInicial = {
    nombre: '',
    estado: true,
    descripcion: ''
};

function Generos() {
    const [generos, setGeneros] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // =================================
    // CONSULTAR GENEROS
    // =================================

    const cargarGeneros = async () => {
        setCargando(true);

        try {
            const respuesta = await api.get('/api/generos');

            setGeneros(
                Array.isArray(respuesta.data.datos)
                    ? respuesta.data.datos
                    : []
            );
        } catch (error) {
            console.error('Error al consultar géneros:', error);

            Swal.fire(
                'Error',
                error.response?.data?.mensaje ||
                    'No fue posible consultar los géneros.',
                'error'
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarGeneros();
    }, []);

    // =================================
    // ABRIR FORMULARIO NUEVO
    // =================================

    const nuevoGenero = () => {
        setFormulario(formularioInicial);
        setIdEdicion(null);
        setMostrarFormulario(true);
    };

    // =================================
    // EDITAR GENERO
    // =================================

    const editarGenero = (genero) => {
        setIdEdicion(genero.IdGenero);

        setFormulario({
            nombre: genero.Nombre || '',
            estado: Boolean(genero.Estado),
            descripcion: genero.Descripcion || ''
        });

        setMostrarFormulario(true);
    };

    // =================================
    // REGISTRAR / ACTUALIZAR
    // =================================

    const guardarGenero = async (e) => {
        e.preventDefault();

        if (!formulario.nombre.trim()) {
            Swal.fire(
                'Campo obligatorio',
                'Debes ingresar el nombre del género.',
                'warning'
            );
            return;
        }

        setGuardando(true);

        try {
            const datos = {
                nombre: formulario.nombre.trim(),
                estado: formulario.estado,
                descripcion: formulario.descripcion.trim()
            };

            if (idEdicion !== null) {
                await api.put(
                    `/api/generos/${idEdicion}`,
                    datos
                );

                await Swal.fire(
                    'Actualizado',
                    'El género fue actualizado correctamente.',
                    'success'
                );
            } else {
                await api.post('/api/generos', datos);

                await Swal.fire(
                    'Registrado',
                    'El género fue creado correctamente.',
                    'success'
                );
            }

            setMostrarFormulario(false);
            setFormulario(formularioInicial);
            setIdEdicion(null);

            await cargarGeneros();

        } catch (error) {
            console.error('Error al guardar género:', error);

            Swal.fire(
                'No se pudo guardar',
                error.response?.data?.mensaje ||
                    'Ocurrió un error al guardar el género.',
                'error'
            );
        } finally {
            setGuardando(false);
        }
    };

    // =================================
    // ELIMINAR GENERO
    // =================================

    const eliminarGenero = async (genero) => {
        const confirmacion = await Swal.fire({
            title: '¿Eliminar género?',
            text: `Se eliminará "${genero.Nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545'
        });

        if (!confirmacion.isConfirmed) return;

        try {
            await api.delete(`/api/generos/${genero.IdGenero}`);

            await Swal.fire(
                'Eliminado',
                'El género fue eliminado correctamente.',
                'success'
            );

            await cargarGeneros();

        } catch (error) {
            console.error('Error al eliminar género:', error);

            Swal.fire(
                'No se pudo eliminar',
                error.response?.data?.mensaje ||
                    'No fue posible eliminar el género. Verifica si tiene películas relacionadas.',
                'error'
            );
        }
    };

    // =================================
    // BUSQUEDA
    // =================================

    const generosFiltrados = generos.filter(genero =>
        genero.Nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );

    // =================================
    // INTERFAZ
    // =================================

    return (
        <div className="page-content">

            <div className="welcome-section">
                <div>
                    <span className="eyebrow">
                        GESTIÓN DEL CATÁLOGO
                    </span>

                    <h2>Administración de géneros</h2>

                    <p>
                        Consulta, registra y administra los géneros
                        cinematográficos.
                    </p>
                </div>

                <button
                    className="btn-refresh"
                    onClick={nuevoGenero}
                >
                    + Nuevo género
                </button>
            </div>

            <div className="stats-grid" style={{
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
            }}>
                <div className="stat-card">
                    <div className="stat-icon blue">◈</div>
                    <div className="stat-info">
                        <span>Total de géneros</span>
                        <h2>{generos.length}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">✓</div>
                    <div className="stat-info">
                        <span>Géneros activos</span>
                        <h2>
                            {generos.filter(g => g.Estado).length}
                        </h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">○</div>
                    <div className="stat-info">
                        <span>Géneros inactivos</span>
                        <h2>
                            {generos.filter(g => !g.Estado).length}
                        </h2>
                    </div>
                </div>
            </div>

            {mostrarFormulario && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">

                        <div className="d-flex justify-content-between mb-4">
                            <h5 className="fw-bold">
                                {idEdicion !== null
                                    ? 'Editar género'
                                    : 'Registrar nuevo género'}
                            </h5>

                            <button
                                className="btn-close"
                                onClick={() => setMostrarFormulario(false)}
                                aria-label="Cerrar"
                            />
                        </div>

                        <form onSubmit={guardarGenero}>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Nombre del género *
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ejemplo: Ciencia ficción"
                                    value={formulario.nombre}
                                    maxLength={100}
                                    onChange={e =>
                                        setFormulario({
                                            ...formulario,
                                            nombre: e.target.value
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Descripción
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="3"
                                    maxLength={500}
                                    placeholder="Describe el género cinematográfico..."
                                    value={formulario.descripcion}
                                    onChange={e =>
                                        setFormulario({
                                            ...formulario,
                                            descripcion: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="form-check form-switch mb-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="estadoGenero"
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
                                    htmlFor="estadoGenero"
                                >
                                    Género activo
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
                                        : 'Registrar género'}
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setMostrarFormulario(false)}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>

                        </form>
                    </div>
                </div>
            )}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between
                        align-items-center flex-wrap gap-3 mb-4">

                        <div>
                            <h5 className="fw-bold mb-1">
                                Listado de géneros
                            </h5>

                            <small className="text-secondary">
                                Registros almacenados en Neon PostgreSQL.
                            </small>
                        </div>

                        <div className="d-flex gap-2">
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar género..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                            />

                            <button
                                className="btn btn-outline-primary"
                                onClick={cargarGeneros}
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
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>

                                {cargando ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            Cargando géneros...
                                        </td>
                                    </tr>
                                ) : generosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            No se encontraron géneros.
                                        </td>
                                    </tr>
                                ) : (
                                    generosFiltrados.map(genero => (
                                        <tr key={genero.IdGenero}>

                                            <td>
                                                {genero.IdGenero}
                                            </td>

                                            <td className="fw-semibold">
                                                {genero.Nombre}
                                            </td>

                                            <td>
                                                {genero.Descripcion || 'Sin descripción'}
                                            </td>

                                            <td>
                                                <span className={`badge ${
                                                    genero.Estado
                                                        ? 'bg-success'
                                                        : 'bg-secondary'
                                                }`}>
                                                    {genero.Estado
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="d-flex gap-2">

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => editarGenero(genero)}
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => eliminarGenero(genero)}
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
    Mostrando {generosFiltrados.length} de {generos.length} géneros.
</div>

                </div>
            </div>
        </div>
    );
}

export default Generos;
