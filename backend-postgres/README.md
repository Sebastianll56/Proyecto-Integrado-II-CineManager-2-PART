# CineManager - Backend PostgreSQL para Render

Este directorio contiene una variante separada del Backend para desplegar CineManager en Render usando PostgreSQL de Neon. El Backend original, situado en la raíz del repositorio y conectado a SQL Server, se conserva sin cambios.

## Requisitos

- Node.js 20 o superior.
- Una base de datos PostgreSQL, por ejemplo Neon.
- La variable `DATABASE_URL` con la cadena de conexión de PostgreSQL.

## Instalación y ejecución local

Desde esta carpeta:

```bash
npm install
```

Crea un archivo `.env` local (no lo publiques en GitHub) con este contenido:

```env
DATABASE_URL=postgresql://USUARIO:CONTRASENA@HOST/BASE?sslmode=require
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Inicia el servicio:

```bash
npm start
```

En el primer inicio, el servidor verifica la conexión y ejecuta `database/schema.sql` para crear las tablas si todavía no existen. También registra los tipos básicos Película y Serie cuando no están creados.

## Rutas

- `GET /api/estado`
- `/api/generos`
- `/api/directores`
- `/api/productoras`
- `/api/tipos`
- `/api/media`

Cada módulo implementa GET, GET por ID, POST, PUT y DELETE.

## Variables de entorno en Render

Configurar en el servicio Web:

- `DATABASE_URL`: cadena de conexión de Neon (mantener Connection pooling activado en Neon).
- `FRONTEND_URL`: URL pública del Static Site de Render, sin barra al final.
- `NODE_ENV`: `production`.

Build command: `npm install`
Start command: `npm start`
Root directory del servicio: `backend-postgres`

No subas `.env` ni contraseñas al repositorio.
