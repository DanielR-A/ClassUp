import { Router } from "express";

import { EspecialidadController } from "../controllers/especialidad.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import {
    cambiarEstadoEspecialidadSchema,
} from "../dtos/especialidad.dto";

export class EspecialidadRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new EspecialidadController();

        // GET http://localhost:3000/especialidad
        router.get(
            "/",
            asyncHandler(controller.listar),
        );

        // GET http://localhost:3000/especialidad/1
        router.get(
            "/:id",
            asyncHandler(controller.obtenerPorId),
        );

        // PATCH http://localhost:3000/especialidad/1/estado
        router.patch(
            "/:id/estado",
            validateRequest(
                cambiarEstadoEspecialidadSchema,
            ),
            asyncHandler(controller.cambiarEstado),
        );

        return router;
    }
}