
import React, { useEffect, useState } from 'react';

import {
    BrowserRouter,
    Switch,
    Route,
    NavLink,
    Link,
    useLocation
} from 'react-router-dom';

import api from './services/api';

import Generos from './pages/Generos';
import Directores from './pages/Directores';
import Productoras from './pages/Productoras';
import Tipos from './pages/Tipos';
import Media from './pages/Media';

// =====================================================
// CONFIGURACION DE LOS MODULOS
// =====================================================

const modulos = [

    {
        nombre: 'Géneros',
        ruta: '/generos',
        icono: '◈',
        endpoint: '/api/generos'
    },

    {
        nombre: 'Directores',
        ruta: '/directores',
        icono: '♙',
        endpoint: '/api/directores'
    },

    {
        nombre: 'Productoras',
        ruta: '/productoras',
        icono: '▣',
        endpoint: '/api/productoras'
    },

    {
        nombre: 'Tipos',
        ruta: '/tipos',
        icono: '▤',
        endpoint: '/api/tipos'
    },

    {
        nombre: 'Películas y series',
        ruta: '/media',
        icono: '▻',
        endpoint: '/api/media'
    }

];

// =====================================================
// MENU LATERAL
// =====================================================

function Sidebar() {

    return (

        <aside className="sidebar">

            <div className="brand">

                <div className="brand-icon">
                    C
                </div>

                <div>

                    <h4>CINEMANAGER</h4>

                    <small>
                        Administración audiovisual
                    </small>

                </div>

            </div>

            <div className="sidebar-section">
                MENÚ PRINCIPAL
            </div>

            <NavLink
                exact
                to="/"
                className="nav-link-custom"
                activeClassName="active"
            >

                <span>▦</span>

                Panel principal

            </NavLink>

            <div className="sidebar-section">
                GESTIÓN DE DATOS
            </div>

            {modulos.map(modulo => (

                <NavLink
                    key={modulo.ruta}
                    to={modulo.ruta}
                    className="nav-link-custom"
                    activeClassName="active"
                >

                    <span>
                        {modulo.icono}
                    </span>

                    {modulo.nombre}

                </NavLink>

            ))}

            <div className="sidebar-footer">

                <div className="status-indicator"></div>

                API de películas y series

                <small>
                    Servidor local · Puerto 3001
                </small>

            </div>

        </aside>

    );

}

// =====================================================
// BARRA SUPERIOR
// =====================================================

function Navbar() {

    const location = useLocation();

    const moduloActual = modulos.find(
        modulo => modulo.ruta === location.pathname
    );

    return (

        <header className="topbar">

            <div>

                <span className="breadcrumb-text">
                    CINEMANAGER
                </span>

                <h5>
                    {moduloActual?.nombre || 'Panel principal'}
                </h5>

            </div>

            <div className="user-profile">

                <div className="user-avatar">
                    SL
                </div>

                <div>

                    <strong>
                        Administrador
                    </strong>

                    <small>
                        Gestión del catálogo
                    </small>

                </div>

            </div>

        </header>

    );

}

// =====================================================
// PANEL PRINCIPAL
// =====================================================

function Dashboard() {

    const [estadisticas, setEstadisticas] = useState({

        generos: 0,
        directores: 0,
        productoras: 0,
        tipos: 0,
        media: 0

    });

    const [apiActiva, setApiActiva] = useState(null);

    const [cargando, setCargando] = useState(true);

    // ================================================
    // CONSULTAR ESTADISTICAS
    // ================================================

    const cargarDatos = async () => {

        setCargando(true);

        try {

            const respuestaEstado = await api.get('/api/estado');

            setApiActiva(
                respuestaEstado.data.api === 'Activa'
            );

            const resultados = await Promise.allSettled(

                modulos.map(modulo =>
                    api.get(modulo.endpoint)
                )

            );

            const claves = [

                'generos',
                'directores',
                'productoras',
                'tipos',
                'media'

            ];

            const nuevasEstadisticas = {};

            resultados.forEach((resultado, index) => {

                const clave = claves[index];

                if (resultado.status === 'fulfilled') {

                    const datos = resultado.value.data;

                    if (typeof datos.total === 'number') {

                        nuevasEstadisticas[clave] =
                            datos.total;

                    } else if (Array.isArray(datos.datos)) {

                        nuevasEstadisticas[clave] =
                            datos.datos.length;

                    } else {

                        nuevasEstadisticas[clave] = 0;

                    }

                } else {

                    console.error(
                        `Error al consultar ${clave}:`,
                        resultado.reason
                    );

                    nuevasEstadisticas[clave] = 0;

                }

            });

            setEstadisticas(nuevasEstadisticas);

        } catch (error) {

            console.error(
                'Error al conectar con la API:',
                error
            );

            setApiActiva(false);

        } finally {

            setCargando(false);

        }

    };

    useEffect(() => {

        cargarDatos();

    }, []);

    // ================================================
    // TARJETAS DE ESTADISTICAS
    // ================================================

    const tarjetas = [

        {
            titulo: 'Géneros',
            valor: estadisticas.generos,
            icono: '◈',
            color: 'blue'
        },

        {
            titulo: 'Directores',
            valor: estadisticas.directores,
            icono: '♙',
            color: 'purple'
        },

        {
            titulo: 'Productoras',
            valor: estadisticas.productoras,
            icono: '▣',
            color: 'orange'
        },

        {
            titulo: 'Tipos',
            valor: estadisticas.tipos,
            icono: '▤',
            color: 'green'
        },

        {
            titulo: 'Películas y series',
            valor: estadisticas.media,
            icono: '▻',
            color: 'pink'
        }

    ];

    return (

        <div className="page-content">

            {/* BIENVENIDA */}

            <div className="welcome-section">

                <div>

                    <span className="eyebrow">
                        RESUMEN GENERAL
                    </span>

                    <h2>
                        Bienvenido a CineManager
                    </h2>

                    <p>
                        Administra tu catálogo de películas
                        y series desde un solo lugar.
                    </p>

                </div>

                <div
                    className={`api-badge ${
                        apiActiva === true
                            ? 'online'
                            : 'offline'
                    }`}
                >

                    <span></span>

                    {apiActiva === null
                        ? 'Verificando API'
                        : apiActiva
                            ? 'API conectada'
                            : 'API desconectada'
                    }

                </div>

            </div>

            {/* ESTADISTICAS */}

            <div className="section-heading">

                <div>

                    <h4>
                        Estadísticas del catálogo
                    </h4>

                    <p>
                        Información obtenida directamente
                        desde SQL Server.
                    </p>

                </div>

                <button
                    className="btn-refresh"
                    onClick={cargarDatos}
                    disabled={cargando}
                >

                    {cargando
                        ? 'Consultando...'
                        : '↻ Actualizar'
                    }

                </button>

            </div>

            <div className="stats-grid">

                {tarjetas.map(tarjeta => (

                    <div
                        className="stat-card"
                        key={tarjeta.titulo}
                    >

                        <div
                            className={`stat-icon ${tarjeta.color}`}
                        >

                            {tarjeta.icono}

                        </div>

                        <div className="stat-info">

                            <span>
                                {tarjeta.titulo}
                            </span>

                            <h2>
                                {cargando
                                    ? '...'
                                    : tarjeta.valor
                                }
                            </h2>

                        </div>

                    </div>

                ))}

            </div>

            {/* ADMINISTRACION DE MODULOS */}

            <div className="section-heading modules-heading">

                <div>

                    <h4>
                        Administración de módulos
                    </h4>

                    <p>
                        Selecciona el módulo que deseas administrar.
                    </p>

                </div>

            </div>

            <div className="modules-grid">

                {modulos.map(modulo => (

                    <Link
                        to={modulo.ruta}
                        className="module-card"
                        key={modulo.ruta}
                    >

                        <span className="module-icon">
                            {modulo.icono}
                        </span>

                        <h5>
                            {modulo.nombre}
                        </h5>

                        <p>
                            Consultar y administrar registros.
                        </p>

                        <span className="module-action">
                            Abrir módulo →
                        </span>

                    </Link>

                ))}

            </div>

        </div>

    );

}

// =====================================================
// ESTRUCTURA PRINCIPAL
// =====================================================

function AppLayout() {

    return (

        <div className="app-layout">

            <Sidebar />

            <main className="main-area">

                <Navbar />

                <Switch>

                    {/* PANEL PRINCIPAL */}

                    <Route
                        exact
                        path="/"
                        component={Dashboard}
                    />

                    {/* GENEROS */}

                    <Route
                        exact
                        path="/generos"
                        component={Generos}
                    />

                    {/* DIRECTORES */}

                    <Route
                        exact
                        path="/directores"
                        component={Directores}
                    />

                    {/* PRODUCTORAS */}

                    <Route
                        exact
                        path="/productoras"
                        component={Productoras}
                    />

                    {/* TIPOS */}

                    <Route
                        exact
                        path="/tipos"
                        component={Tipos}
                    />

                    {/* PELICULAS Y SERIES */}

                    <Route
                        exact
                        path="/media"
                        component={Media}
                    />

                    {/* PAGINA NO ENCONTRADA */}

                    <Route
                        render={() => (

                            <div className="page-content">

                                <h2>
                                    Página no encontrada
                                </h2>

                                <Link
                                    to="/"
                                    className="btn-refresh"
                                >
                                    Volver al inicio
                                </Link>

                            </div>

                        )}
                    />

                </Switch>

            </main>

        </div>

    );

}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

function App() {

    return (

        <BrowserRouter>

            <AppLayout />

        </BrowserRouter>

    );

}

export default App;
