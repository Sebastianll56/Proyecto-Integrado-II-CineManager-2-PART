const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    throw new Error('Falta configurar la variable de entorno DATABASE_URL.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on('error', (error) => {
    console.error('Error inesperado en el pool de PostgreSQL:', error.message);
});

async function connectDB() {
    const client = await pool.connect();

    try {
        await client.query('SELECT 1');
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('Conexión con PostgreSQL establecida y esquema verificado.');
    } finally {
        client.release();
    }
}

module.exports = { pool, connectDB };
