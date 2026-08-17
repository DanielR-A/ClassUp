import { Router } from "express";

import { UsuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import {
    cambiarEstadoUsuarioSchema,
} from "../dtos/usuario.dto";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UsuarioController();

        // GET http://localhost:3000/usuario
        router.get(
            "/",
            asyncHandler(controller.listar),
        );

        // GET http://localhost:3000/usuario/1
        router.get(
            "/:id",
            asyncHandler(controller.obtenerPorId),
        );

        // PATCH http://localhost:3000/usuario/1/estado
        router.patch(
            "/:id/estado",
            validateRequest(cambiarEstadoUsuarioSchema),
            asyncHandler(controller.cambiarEstado),
        );

        return router;
    }
}