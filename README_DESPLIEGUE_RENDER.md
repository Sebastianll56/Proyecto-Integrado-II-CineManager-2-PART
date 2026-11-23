# CineManager - Preparación para despliegue gratuito en Render y Neon

## Qué se añadió

- `backend-postgres/`: variante independiente del Backend de CineManager adaptada a PostgreSQL.
- `backend-postgres/database/schema.sql`: esquema de las cinco tablas. El Backend lo ejecuta al iniciar si las tablas aún no existen y agrega los tipos iniciales Película y Serie si faltan.
- `frontend/src/services/api.js`: lee `VITE_API_URL`; conserva `http://localhost:3001` como valor local por defecto.
- `frontend/public/_redirects`: permite que las rutas de React Router funcionen al recargar una página del sitio estático.

El Backend original de la raíz, que utiliza SQL Server, no se reemplazó.

## Añadir los cambios al repositorio local

1. Extrae el contenido de este paquete directamente dentro de la carpeta local del proyecto donde está el `server.js` original. Acepta reemplazar `frontend/src/services/api.js` y `.gitignore`.
2. Abre una terminal en la raíz del repositorio y comprueba los cambios:

```bash
git status
```

3. Publica los archivos nuevos y modificados:

```bash
git add backend-postgres frontend/src/services/api.js frontend/public/_redirects frontend/.env.example .gitignore README_DESPLIEGUE_RENDER.md
git commit -m "Agrega backend PostgreSQL para despliegue en Render"
git push origin main
```

No agregues archivos `.env`, contraseñas ni carpetas `node_modules`.

## Servicio Backend en Render

Crear un **Web Service** desde el mismo repositorio y configurar:

- Root Directory: `backend-postgres`
- Build Command: `npm install`
- Start Command: `npm start`
- Plan: Free

Variables de entorno del servicio:

- `DATABASE_URL`: cadena de conexión de Neon, preferiblemente la opción con pooling.
- `NODE_ENV`: `production`
- `FRONTEND_URL`: se completa con la URL pública del Static Site de Render, después de crearlo.

La primera vez que arranca correctamente, el Backend crea el esquema en Neon de forma automática.

## Servicio Frontend en Render

Crear un **Static Site** desde el mismo repositorio:

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Variable de entorno:

- `VITE_API_URL`: URL pública del Web Service Backend, por ejemplo `https://nombre-api.onrender.com` (sin barra final).

Después de crear el Static Site, copiar su URL pública y agregarla en `FRONTEND_URL` del Web Service Backend. Guardar los cambios y volver a desplegar el Backend.

## Datos de la base de datos

Neon inicia con una base de datos nueva. El esquema crea automáticamente las tablas; también inserta Película y Serie en Tipo si todavía no existen. Los datos que actualmente están en SQL Server local no se copian automáticamente. Los géneros, directores y productoras deberán registrarse en la versión desplegada de CineManager, o migrarse posteriormente mediante una exportación independiente.

## Comprobación final

Cuando ambos servicios estén publicados:

1. Abrir `https://<backend>.onrender.com/api/estado` y comprobar que responde `"api": "Activa"`.
2. Consultar `/api/generos`, `/api/directores`, `/api/productoras`, `/api/tipos` y `/api/media`.
3. Abrir la URL del Static Site y probar alta, consulta, edición y eliminación en los cinco módulos.
4. Crear previamente un género, un director y una productora activos para poder registrar una película o serie en Media.

El servicio web gratuito de Render puede suspenderse por inactividad y tardar en responder cuando vuelve a activarse. Este despliegue está pensado para la demostración académica, no como alojamiento de producción con disponibilidad garantizada.
