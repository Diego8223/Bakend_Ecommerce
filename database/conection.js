import { connect } from "mongoose";
import dotenv from "dotenv";

// Configurar el dotenv para usar variables de entorno
dotenv.config();

// Función para establecer la conexión con MongoDB
const connection = async () => {
  try {
    // Conectar a la base de datos con la URI proporcionada en las variables de entorno
    await connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Conectado correctamente a la base de datos BAKEND_COMMERCEDB");
  } catch (error) {
    // En caso de error, imprimir el mensaje de error
    console.error("Error al conectar a la BD:", error);
    throw new Error("¡No se ha podido conectar a la base de datos!");
  }
};

export default connection;
