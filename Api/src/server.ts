import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { AppRoutes } from "./routes/routes";
import { ErrorMiddleware } from "./middlewares/error.middleware";

import path from "path/win32";

// ==========================================================
// Crea la aplicación de Express.
// A partir de este objeto se configura todo el servidor.
// ==========================================================
const app = express();

// ==========================================================
// Carga las variables del archivo .env
// ==========================================================
dotenv.config();

// ==========================================================
// Obtiene el puerto desde el archivo .env.
// Si no existe, utiliza el puerto 3000.
// ==========================================================
const port = process.env.PORT || 3000;

// ==========================================================
// MIDDLEWARES
// ==========================================================

// Permite que aplicaciones externas (Angular, Postman, etc.)
// puedan consumir esta API.
app.use(cors());

// Muestra en consola todas las peticiones que llegan
// al servidor.
app.use(morgan("dev"));

// Permite recibir datos en formato JSON.
app.use(express.json());

// Permite recibir datos enviados desde formularios.
app.use(
    express.urlencoded({
        extended: true,
    })
);

// ==========================================================
// RUTA PRINCIPAL
// ==========================================================
// Si alguien entra a:
// http://localhost:3000/
// responde con un mensaje indicando que la API funciona.
app.get("/", (req, res) => {

    res.json({
        message: "API de ClassUp funcionando correctamente",
    });

});

// ==========================================================
// REGISTRO DE TODAS LAS RUTAS DE LA APLICACIÓN
// ==========================================================
// Aquí se cargan las rutas de Categoría,
// Usuarios, Servicios, Profesionales, etc.
app.use(AppRoutes.routes);

// ==========================================================
// MIDDLEWARE GLOBAL PARA EL MANEJO DE ERRORES
// ==========================================================
// Captura cualquier excepción producida en la aplicación.
app.use(ErrorMiddleware.handleError);

// ==========================================================
// CARPETA PÚBLICA PARA IMÁGENES
// ==========================================================
// Todo lo que esté dentro de assets/uploads
// podrá accederse desde:
//
// http://localhost:3000/images/archivo.jpg
//
app.use(
    "/images",
    express.static(
        path.join(
            path.resolve(),
            "assets/uploads"
        )
    )
);

// ==========================================================
// INICIA EL SERVIDOR
// ==========================================================
// Comienza a escuchar peticiones en el puerto indicado.
app.listen(port, () => {

    console.log(`http://localhost:${port}`);
    console.log("Presione CTRL-C para detenerlo\n");

});