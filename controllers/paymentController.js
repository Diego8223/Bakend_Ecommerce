// paymentController.js
const mercadopago = require('mercadopago');

// Configuración de Mercado Pago usando el método recomendado
mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN);

// Función para crear la preferencia de pago
const crearPreferencia = async (req, res) => {
    const { items } = req.body; // Recibe los productos desde el frontend

    try {
        // Verifica si los productos fueron enviados correctamente
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No se recibieron productos' });
        }

        // Validación adicional para verificar que cada producto tenga la estructura correcta
        for (let item of items) {
            if (!item.titulo || !item.precio || isNaN(item.precio)) {
                return res.status(400).json({ error: 'Producto inválido: falta título o precio inválido.' });
            }
        }

        // Definir la preferencia de pago
        const preference = {
            items: items.map(item => ({
                title: item.titulo,   // Título del producto
                unit_price: parseFloat(item.precio),  // Precio del producto
                quantity: item.cantidad || 1, // Cantidad de productos, por defecto 1
            })),
            back_urls: {
                success: "http://localhost:5000/success", // URL de éxito
                failure: "http://localhost:5000/failure", // URL de fallo
                pending: "http://localhost:5000/pending", // URL de pago pendiente
            },
            auto_return: "approved", // Redirige automáticamente después de un pago aprobado
        };

        // Crear preferencia de pago en Mercado Pago
        const response = await mercadopago.preferences.create(preference);

        // Devuelve la respuesta con el ID y la URL de pago
        return res.json({
            id: response.body.id,
            init_point: response.body.init_point, // URL para redirigir al usuario a Mercado Pago
        });
    } catch (error) {
        console.error('Error al crear la preferencia:', error);
        return res.status(500).json({ error: 'Error al crear el pago' });
    }
};

// Exporta las funciones del controlador
module.exports = {
    crearPreferencia,
};
