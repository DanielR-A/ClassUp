import { Router } from "express";

import { CitaController } from "../controllers/cita.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

export class CitaRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new CitaController();

        // GET http://localhost:3000/cita
        router.get(
            "/",
            asyncHandler(controller.listar),
        );

        // PATCH http://localhost:3000/cita/1/aceptar
        router.patch(
            "/:id/aceptar",
            authenticateToken,
            asyncHandler(controller.aceptar),
        );

        // GET http://localhost:3000/cita/1
        router.get(
            "/:id",
            asyncHandler(controller.obtenerPorId),
        );

        return router;
    }
}