const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (opcional)
app.use(express.json());

// Rutas de ejemplo
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
