
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const formularioInicial = {
    nombre: '',
    estado: true,
    slogan: '',
    descripcion: ''
};

function Productoras() {
    const [productoras, setProductoras] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // =========================================
    // CONSULTAR PRODUCTORAS
    // =========================================

    const cargarProductoras = async () => {
        setCargando(true);

        try {
            const respuesta = await api.get('/api/productoras');

            setProductoras(
                Array.isArray(respuesta.data.datos)
                    ? respuesta.data.datos
                    : []
            );

        } catch (error) {
            console.error('Error al consultar productoras:', error);

            Swal.fire(
                'Error',
                error.response?.data?.mensaje ||
                'No fue posible consultar las productoras.',
                'error'
            );

        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductoras();
    }, []);

    // =========================================
    // NUEVA PRODUCTORA
    // =========================================

    const nuevaProductora = () => {
        setFormulario(formularioInicial);
        setIdEdicion(null);
        setMostrarFormulario(true);
    };

    // =========================================
    // EDITAR PRODUCTORA
    // =========================================

    const editarProductora = (productora) => {
        setIdEdicion(productora.IdProductora);

        setFormulario({
            nombre: productora.Nombre || '',
            estado: Boolean(productora.Estado),
            slogan: productora.Slogan || '',
            descripcion: productora.Descripcion || ''
        });

        setMostrarFormulario(true);
    };

    // =========================================
    // REGISTRAR / ACTUALIZAR PRODUCTORA
    // =========================================

    const guardarProductora = async (e) => {
        e.preventDefault();

        if (!formulario.nombre.trim()) {
            Swal.fire(
                'Campo obligatorio',
                'Debes ingresar el nombre de la productora.',
                'warning'
            );
            return;
        }

        setGuardando(true);

        try {
            const datos = {
                nombre: formulario.nombre.trim(),
                estado: formulario.estado,
                slogan: formulario.slogan.trim() || null,
                descripcion: formulario.descripcion.trim() || null
            };

            if (idEdicion !== null) {

                await api.put(
                    `/api/productoras/${idEdicion}`,
                    datos
                );

                await Swal.fire(
                    'Actualizada',
                    'La productora fue actualizada correctamente.',
                    'success'
                );

            } else {

                await api.post('/api/productoras', datos);

                await Swal.fire(
                    'Registrada',
                    'La productora fue registrada correctamente.',
                    'success'
                );
            }

            setMostrarFormulario(false);
            setFormulario(formularioInicial);
            setIdEdicion(null);

            await cargarProductoras();

        } catch (error) {
            console.error('Error al guardar productora:', error);

            Swal.fire(
                'No se pudo guardar',
                error.response?.data?.mensaje ||
                'Ocurrió un error al guardar la productora.',
                'error'
            );

        } finally {
            setGuardando(false);
        }
    };

    // =========================================
    // ELIMINAR PRODUCTORA
    // =========================================

    const eliminarProductora = async (productora) => {

        const confirmacion = await Swal.fire({
            title: '¿Eliminar productora?',
            text: `Se eliminará "${productora.Nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545'
        });

        if (!confirmacion.isConfirmed) return;

        try {
            await api.delete(
                `/api/productoras/${productora.IdProductora}`
            );

            await Swal.fire(
                'Eliminada',
                'La productora fue eliminada correctamente.',
                'success'
            );

            await cargarProductoras();

        } catch (error) {
            console.error('Error al eliminar productora:', error);

            Swal.fire(
                'No se pudo eliminar',
                error.response?.data?.mensaje ||
                'No fue posible eliminar la productora. Verifica si tiene películas relacionadas.',
                'error'
            );
        }
    };

    // =========================================
    // BUSQUEDA
    // =========================================

    const productorasFiltradas = productoras.filter(productora =>
        productora.Nombre?.toLowerCase().includes(
            busqueda.toLowerCase()
        )
    );

    // =========================================
    // ESTADISTICAS
    // =========================================

    const activas = productoras.filter(
        productora => productora.Estado
    ).length;

    const inactivas = productoras.length - activas;

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
                        Administración de productoras
                    </h2>

                    <p>
                        Consulta, registra y administra las
                        productoras del catálogo audiovisual.
                    </p>
                </div>

                <button
                    className="btn-refresh"
                    onClick={nuevaProductora}
                >
                    + Nueva productora
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
                    <div className="stat-icon blue">▣</div>

                    <div className="stat-info">
                        <span>Total de productoras</span>
                        <h2>{productoras.length}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">✓</div>

                    <div className="stat-info">
                        <span>Productoras activas</span>
                        <h2>{activas}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">○</div>

                    <div className="stat-info">
                        <span>Productoras inactivas</span>
                        <h2>{inactivas}</h2>
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
                                    ? 'Editar productora'
                                    : 'Registrar nueva productora'}
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

                        <form onSubmit={guardarProductora}>

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Nombre de la productora *
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ejemplo: Warner Bros."
                                    value={formulario.nombre}
                                    maxLength={150}
                                    required
                                    onChange={e =>
                                        setFormulario({
                                            ...formulario,
                                            nombre: e.target.value
                                        })
                                    }
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Slogan
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Frase representativa de la productora"
                                    value={formulario.slogan}
                                    maxLength={250}
                                    onChange={e =>
                                        setFormulario({
                                            ...formulario,
                                            slogan: e.target.value
                                        })
                                    }
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label fw-semibold">
                                    Descripción
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Descripción de la productora..."
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

                            <div className="form-check form-switch mb-4">

                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="estadoProductora"
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
                                    htmlFor="estadoProductora"
                                >
                                    Productora activa
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
                                        : 'Registrar productora'}
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
                                Listado de productoras
                            </h5>

                            <small className="text-secondary">
                                Registros almacenados en SQL Server.
                            </small>
                        </div>

                        <div className="d-flex gap-2">

                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar productora..."
                                value={busqueda}
                                onChange={e =>
                                    setBusqueda(e.target.value)
                                }
                            />

                            <button
                                className="btn btn-outline-primary"
                                onClick={cargarProductoras}
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
                                    <th>Nombre</th>
                                    <th>Slogan</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>

                                {cargando ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-5"
                                        >
                                            Cargando productoras...
                                        </td>
                                    </tr>

                                ) : productorasFiltradas.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-5"
                                        >
                                            No se encontraron productoras.
                                        </td>
                                    </tr>

                                ) : (

                                    productorasFiltradas.map(productora => (

                                        <tr key={productora.IdProductora}>

                                            <td>
                                                {productora.IdProductora}
                                            </td>

                                            <td className="fw-semibold">
                                                {productora.Nombre}
                                            </td>

                                            <td>
                                                {productora.Slogan || 'Sin slogan'}
                                            </td>

                                            <td>
                                                {productora.Descripcion || 'Sin descripción'}
                                            </td>

                                            <td>

                                                <span
                                                    className={`badge ${
                                                        productora.Estado
                                                            ? 'bg-success'
                                                            : 'bg-secondary'
                                                    }`}
                                                >
                                                    {productora.Estado
                                                        ? 'Activa'
                                                        : 'Inactiva'}
                                                </span>

                                            </td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            editarProductora(productora)
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            eliminarProductora(productora)
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
                        Mostrando {productorasFiltradas.length} de {productoras.length} productoras.
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Productoras;
