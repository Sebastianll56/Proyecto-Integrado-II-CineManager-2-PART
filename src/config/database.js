
/* =====================================================
   PROYECTO INTEGRADO 2
   API REST - PELICULAS Y SERIES
   Conexion con SQL Server
   ===================================================== */

const sql = require('mssql/msnodesqlv8');

// Configuracion mediante cadena ODBC
const config = {
    connectionString:
        'Driver={ODBC Driver 18 for SQL Server};' +
        'Server={localhost\\SQLEXPRESS};' +
        'Database={ProyectoIntegrado2_Peliculas};' +
        'Trusted_Connection=Yes;' +
        'Encrypt=Yes;' +
        'TrustServerCertificate=Yes;',

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Funcion de conexion
async function connectDB() {
    try {
        const pool = await sql.connect(config);

        console.log('====================================');
        console.log(' CONEXION EXITOSA CON SQL SERVER');
        console.log('====================================');

        return pool;

    } catch (error) {
        console.error('ERROR DE CONEXION:');
        console.error(error.message);
        throw error;
    }
}

// Exportar conexion
module.exports = {
    sql,
    connectDB
};

// Prueba de conexion
if (require.main === module) {
    connectDB()
        .then(async (pool) => {

            const resultado = await pool.request().query(`
                SELECT
                    @@SERVERNAME AS Servidor,
                    DB_NAME() AS BaseDeDatos,
                    GETDATE() AS FechaConexion;
            `);

            console.log('\nINFORMACION DEL SERVIDOR:');
            console.table(resultado.recordset);

            await pool.close();

        })
        .catch(() => {
            process.exitCode = 1;
        });
}
