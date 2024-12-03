// errorHandler.js

const errorHandler = (err, req, res, next) => {
    // Registrar el error con más detalles
    console.error('Error:', err.message || err);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);  // Imprimir el stack trace si estamos en desarrollo
    }

    // Respuesta de error genérica
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Ha ocurrido un error en el servidor',
        // Opcional: incluir un código de error o detalles adicionales
        code: err.code || 'INTERNAL_SERVER_ERROR',
        // Detalles del error, si es necesario
        details: err.details || null
    });
};

module.exports = errorHandler;
