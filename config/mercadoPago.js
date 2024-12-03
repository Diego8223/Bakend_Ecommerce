const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware para manejo de JSON y CORS
app.use(express.json());
app.use(cors());

// Configuración de Mercado Pago
mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN);

// Ruta para crear la preferencia de pago
app.post('/crear-preferencia', async (req, res, next) => {
    const { items } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No se recibieron productos' });
        }

        // Crear preferencia de pago
        const preference = {
            items: items.map(item => ({
                title: item.titulo, // Nombre del producto
                unit_price: parseFloat(item.precio), // Asegura que el precio sea un número
                quantity: item.cantidad || 1, // Cantidad, por defecto 1
            })),
            back_urls: {
                success: "http://localhost:5000/success",
                failure: "http://localhost:5000/failure",
                pending: "http://localhost:5000/pending",
            },
            auto_return: "approved", // Retorno automático al completar el pago
        };

        const response = await mercadopago.preferences.create(preference);

        // Devolver el ID de la preferencia y el punto de inicio
        return res.json({
            id: response.body.id,
            init_point: response.body.init_point,
        });
    } catch (error) {
        console.error(error);
        next(error); // Pasa el error al siguiente middleware (error handler)
    }
});

// Rutas de redirección para mostrar el estado del pago
app.get('/success', (req, res) => {
    res.send("¡Pago exitoso!");
});

app.get('/failure', (req, res) => {
    res.send("Pago rechazado.");
});

app.get('/pending', (req, res) => {
    res.send("Pago pendiente.");
});

// Manejador de errores (middleware)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Puerto del servidor
const PORT = process.env.PUERTO || 5000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
