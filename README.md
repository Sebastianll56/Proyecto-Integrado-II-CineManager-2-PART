# CineManager – Gestión de películas y series

Aplicación web académica para administrar un catálogo audiovisual. La solución integra un **frontend desarrollado con React** y una **API REST construida con Node.js y Express**, conectada a **Microsoft SQL Server**.

**Repositorio:** [Proyecto-Integrado-II-CineManager-2-PART](https://github.com/Sebastianll56/Proyecto-Integrado-II-CineManager-2-PART)

## Funcionalidades

La aplicación organiza la administración del catálogo en cinco módulos:

| Módulo | Información administrada |
|---|---|
| Géneros | Nombre, descripción y estado del género. |
| Directores | Nombre y estado del director. |
| Productoras | Nombre, slogan, descripción y estado. |
| Tipos | Nombre y descripción del tipo de producción, por ejemplo, Película o Serie. |
| Películas y series (Media) | Serial, título, sinopsis, URL, imagen de portada, año de estreno y relaciones con género, director, productora y tipo. |

Desde la interfaz se pueden consultar registros, crear registros, editar información y eliminar registros con confirmación. Los formularios de Media permiten seleccionar los catálogos relacionados.

## Tecnologías

- **Frontend:** React 19, Vite 8, React Router DOM 5, Axios, Bootstrap 5, CSS y SweetAlert2.
- **Backend:** Node.js, Express 5, CORS y controladores organizados por recurso.
- **Persistencia:** Microsoft SQL Server.
- **Conector de base de datos:** `mssql` con `msnodesqlv8`.
- **Control de versiones:** Git y GitHub.

## Estructura del repositorio

```text
Proyecto-Integrado-II-CineManager-2-PART/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Generos.jsx
│   │   │   ├── Directores.jsx
│   │   │   ├── Productoras.jsx
│   │   │   ├── Tipos.jsx
│   │   │   └── Media.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   └── routes/
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Requisitos previos

Para ejecutar el proyecto localmente se requiere:

1. **Node.js 22.12 o superior** y npm.
2. **Microsoft SQL Server** (la configuración entregada apunta a una instancia SQL Server Express local).
3. **ODBC Driver 18 for SQL Server** instalado en Windows.
4. La base de datos `ProyectoIntegrado2_Peliculas`, con las tablas y relaciones que utiliza la API.

> **Importante sobre la base de datos:** el repositorio publicado no contiene actualmente un archivo `.sql` para crear la base de datos desde cero. Antes de iniciar el Backend, la base `ProyectoIntegrado2_Peliculas` debe existir y tener el esquema correspondiente. Se recomienda incorporar el script de creación y datos iniciales al repositorio para facilitar la instalación en otro equipo.

## Configuración de SQL Server

La conexión se encuentra en:

```text
src/config/database.js
```

La configuración incluida utiliza estos valores locales:

- Driver: `ODBC Driver 18 for SQL Server`.
- Servidor: `localhost\SQLEXPRESS`.
- Base de datos: `ProyectoIntegrado2_Peliculas`.
- Autenticación: integrada de Windows (`Trusted_Connection=Yes`).

Si la instancia, el nombre de la base de datos o el método de autenticación son diferentes en el equipo donde se ejecutará el proyecto, se debe ajustar la cadena de conexión en `src/config/database.js` antes de iniciar el servidor.

## Instalación y ejecución

El Backend y el Frontend se ejecutan en terminales independientes.

### 1. Descargar el proyecto

```bash
git clone https://github.com/Sebastianll56/Proyecto-Integrado-II-CineManager-2-PART.git
cd Proyecto-Integrado-II-CineManager-2-PART
```

### 2. Instalar dependencias del Backend

Desde la carpeta raíz del repositorio:

```bash
npm install
```

### 3. Iniciar la API REST

Desde la carpeta raíz:

```bash
node server.js
```

El servidor Express escucha en:

```text
http://localhost:3001
```

La API intenta conectarse a SQL Server antes de iniciar el servicio HTTP. Por eso, SQL Server debe estar encendido y la base de datos debe estar disponible.

### 4. Instalar dependencias del Frontend

Abre una segunda terminal y entra en la carpeta `frontend`:

```bash
cd frontend
npm install
```

### 5. Iniciar la aplicación React

Desde `frontend`:

```bash
npm run dev
```

Vite mostrará la dirección local. Con la configuración utilizada durante el desarrollo, la aplicación se abre en:

```text
http://localhost:5173
```

Mantén abiertas ambas terminales mientras utilizas CineManager: una para la API y otra para Vite.

## Verificación de la API

Con el Backend iniciado, abre esta dirección en el navegador o consúltala desde Postman:

```http
GET http://localhost:3001/api/estado
```

La ruta devuelve información del estado de la API, el nombre de la base de datos y los módulos registrados.

## Endpoints disponibles

Cada recurso implementa las operaciones REST de consulta, creación, actualización y eliminación:

| Módulo | Endpoint base |
|---|---|
| Géneros | `/api/generos` |
| Directores | `/api/directores` |
| Productoras | `/api/productoras` |
| Tipos | `/api/tipos` |
| Media | `/api/media` |

Para cada endpoint base están definidas estas rutas:

| Método HTTP | Ruta | Operación |
|---|---|---|
| GET | `/api/recurso` | Consultar todos los registros. |
| GET | `/api/recurso/:id` | Consultar un registro por identificador. |
| POST | `/api/recurso` | Crear un registro. |
| PUT | `/api/recurso/:id` | Actualizar un registro. |
| DELETE | `/api/recurso/:id` | Eliminar un registro. |

Por ejemplo, para consultar los géneros:

```http
GET http://localhost:3001/api/generos
```

## Rutas del Frontend

| Ruta | Pantalla |
|---|---|
| `/` | Panel principal e indicadores del catálogo. |
| `/generos` | Administración de géneros. |
| `/directores` | Administración de directores. |
| `/productoras` | Administración de productoras. |
| `/tipos` | Administración de tipos. |
| `/media` | Administración de películas y series. |

## Comandos útiles del Frontend

Desde la carpeta `frontend`:

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Genera la compilación de producción en dist/
npm run preview   # Previsualiza la compilación de producción
npm run lint      # Ejecuta Oxlint
```

## Notas técnicas y alcance

- La URL del Backend está configurada actualmente en `frontend/src/services/api.js` como `http://localhost:3001`. Si se cambia el host o se despliega la API en otro entorno, debe actualizarse esa configuración.
- La conexión a SQL Server está definida en `src/config/database.js` y utiliza autenticación integrada de Windows para la instancia local configurada.
- El proyecto está preparado para ejecución local. Este repositorio no documenta un despliegue público de la aplicación ni de la API.
- No se implementa autenticación de usuarios en esta versión académica; la interfaz presenta un perfil visual de administrador.
- No se deben subir carpetas `node_modules`, archivos de entorno con secretos ni credenciales al repositorio.

## Autoría académica

**Sebastian Londoño Londoño**  
Ingeniería en Software y Datos  
Proyecto Integrado II - Desarrollo de Aplicaciones Web  
IU DIGITAL DE ANTIOQUIA  
Profesor: Federico Henao Villa
