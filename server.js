  import express from 'express';
  import MercadoPago from 'mercadopago';
  import dotenv from 'dotenv';

  dotenv.config(); // Cargar las variables de entorno desde el archivo .env

  const app = express();
  app.use(express.json()); // Middleware para manejar JSON

  // Configuración de MercadoPago
  MercadoPago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN);

  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'; // URL del cliente

  // Crear la preferencia de pago
  app.post('/api/mercadopago/preferencia', async (req, res) => {
    const { items } = req.body;

    // Validar que los productos se hayan enviado correctamente
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debes enviar una lista de productos válida.' });
    }

    // Validar el formato de cada producto
    const isValid = items.every(
      (item) =>
        item.titulo &&
        typeof item.titulo === 'string' &&
        item.precio &&
        typeof item.precio === 'number' &&
        item.cantidad &&
        Number.isInteger(item.cantidad)
    );

    if (!isValid) {
      return res
        .status(400)
        .json({ error: 'Cada producto debe incluir "titulo", "precio" (número) y "cantidad" (entero).' });
    }

    const preference = {
      items: items.map((item) => ({
        title: item.titulo,
        quantity: item.cantidad,
        unit_price: item.precio,
        picture_url: item.imagen || '', // Imagen opcional
      })),
      back_urls: {
        success: `${CLIENT_URL}/success`, // Redirección en caso de éxito
        failure: `${CLIENT_URL}/failure`, // Redirección en caso de fallo
        pending: `${CLIENT_URL}/pending`, // Redirección en caso de estado pendiente
      },
      auto_return: 'approved', // Redirige automáticamente si el pago es aprobado
    };

    try {
      const response = await MercadoPago.preferences.create(preference);
      console.log('Preferencia creada:', response.body);

      // Enviar el ID y la URL de inicialización del pago
      res.json({
        preference_id: response.body.id,
        init_point: response.body.init_point,
      });
    } catch (error) {
      console.error('Error al crear la preferencia:', error);
      res.status(500).json({ error: 'No se pudo crear la preferencia de pago.' });
    }
  });

  // Rutas para manejar respuestas de MercadoPago
  app.get('/success', (req, res) => {
    res.send('¡Pago exitoso!');
  });

  app.get('/failure', (req, res) => {
    res.send('Pago rechazado.');
  });

  app.get('/pending', (req, res) => {
    res.send('Pago pendiente.');
  });

  // Iniciar el servidor
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
