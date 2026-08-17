// Este archivo corresponde a las Routes 
// (Rutas) de la entidad Categoría. Su 
// función es definir las URL de la API y 
// decidir qué controller debe ejecutarse 
// cuando llega una petición.

// En otras palabras, las rutas son la puerta
//  de entrada de tu API.
import { Router } from "express";

import { CategoriaController } from "../controllers/categoria.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import {
    cambiarEstadoCategoriaSchema,
} from "../dtos/categoria.dto";

// ==========================================================
// RUTAS DE CATEGORÍA
// Aquí se definen todos los endpoints relacionados
// con la entidad Categoría.
// ==========================================================

export class CategoriaRoutes {

    static get routes(): Router {

        // Crea un objeto Router de Express
        const router = Router();

        // Crea una instancia del controller
        const controller = new CategoriaController();

        // ==================================================
        // GET /categoria
        // Obtiene el listado de categorías.
        // ==================================================
        router.get(

            "/",

            // Maneja automáticamente errores en métodos async
            asyncHandler(controller.listar),

        );

        // ==================================================
        // GET /categoria/:id
        // Obtiene una categoría específica por su ID.
        // ==================================================
        router.get(

            "/:id",

            asyncHandler(controller.obtenerPorId),

        );

        // ==================================================
        // PATCH /categoria/:id/estado
        // Cambia el estado (activo/inactivo) de una categoría.
        // ==================================================
        router.patch(

            "/:id/estado",

            // Valida el body utilizando Zod antes de
            // ejecutar el controller.
            validateRequest(cambiarEstadoCategoriaSchema),

            // Si la validación es correcta,
            // ejecuta el controller.
            asyncHandler(controller.cambiarEstado),

        );

        // Devuelve todas las rutas configuradas
        return router;
    }
}