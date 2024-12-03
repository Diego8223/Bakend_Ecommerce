const express = require('express');
const MercadoPago = require('mercadopago');
const dotenv = require('dotenv');
dotenv.config();  // Cargar variables de entorno

const app = express();
app.use(express.json());  // Asegúrate de que el servidor pueda leer JSON

// Configuración de MercadoPago usando la variable de entorno
MercadoPago.config({
    access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

// Crear la preferencia de pago
app.post('/api/mercadopago/preferencia', async (req, res) => {
    const { items } = req.body; // Los items deberían venir del frontend

    // Validar que los productos hayan sido enviados
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No se recibieron productos' });
    }

    // Crear la preferencia
    const preference = {
        items: items.map(item => ({
            title: item.titulo, // Título del producto
            quantity: item.cantidad || 1, // Cantidad de productos
            unit_price: parseFloat(item.precio), // Precio del producto
        })),
        back_urls: {
            success: 'http://localhost:5000/success', // URL de éxito
            failure: 'http://localhost:5000/failure', // URL de fallo
            pending: 'http://localhost:5000/pending', // URL de pago pendiente
        },
        auto_return: 'approved', // Redirige automáticamente después de un pago aprobado
    };

    try {
        const response = await MercadoPago.preferences.create(preference);
        // Responder con el ID de la preferencia de pago
        res.json({
            preference_id: response.body.id,
            init_point: response.body.init_point, // URL para iniciar el pago
        });
    } catch (error) {
        console.error('Error al crear la preferencia:', error);
        res.status(500).send('Error al crear la preferencia de pago');
    }
});

// Rutas para manejar las respuestas
app.get('/success', (req, res) => {
    res.send("¡Pago exitoso!");
});

app.get('/failure', (req, res) => {
    res.send("Pago rechazado.");
});

app.get('/pending', (req, res) => {
    res.send("Pago pendiente.");
});

// Iniciar el servidor
app.listen(5000, () => {
    console.log('Servidor corriendo en puerto 5000');
});
