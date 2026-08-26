import { Router } from "express";

import { ResenaController } from "../controllers/resena.controller";

import {
    asyncHandler,
} from "../middlewares/async-handler.middleware";

import {
    authenticateToken,
} from "../middlewares/auth.middleware";

import {
    validateRequest,
} from "../middlewares/validate-request.middleware";

import {
    createResenaSchema,
} from "../dtos/resena.dto";


export class ResenaRoutes {

    static get routes(): Router {

        const router = Router();

        const controller =
            new ResenaController();


        // ==========================================
        // LISTAR RESEÑAS
        // ==========================================

        // GET http://localhost:3000/resena
        router.get(
            "/",
            asyncHandler(
                controller.listar,
            ),
        );


        // ==========================================
        // CREAR RESEÑA
        // ==========================================

        // POST http://localhost:3000/resena
        router.post(
            "/",
            authenticateToken,
            validateRequest(
                createResenaSchema,
            ),
            asyncHandler(
                controller.crear,
            ),
        );


        // ==========================================
        // DETALLE DE RESEÑA
        // ==========================================

        // GET http://localhost:3000/resena/1
        router.get(
            "/:id",
            asyncHandler(
                controller.obtenerPorId,
            ),
        );


        return router;
    }
}