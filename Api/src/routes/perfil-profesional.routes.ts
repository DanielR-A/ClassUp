import { Router } from "express";

import { PerfilProfesionalController } from "../controllers/perfil-profesional.controller";

import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import {
    createPerfilProfesionalSchema,
    updatePerfilProfesionalSchema,
    cambiarDisponibilidadPerfilSchema,
} from "../dtos/perfil-profesional.dto";

export class PerfilProfesionalRoutes {
    static get routes(): Router {
        const router = Router();

        const controller =
            new PerfilProfesionalController();

        /*
         * =========================================
         * LISTAR PERFILES PROFESIONALES
         * =========================================
         *
         * GET
         * http://localhost:3000/perfilProfesional
         */
        router.get(
            "/",
            asyncHandler(
                controller.listar,
            ),
        );


        /*
         * =========================================
         * LISTAR IMÁGENES DISPONIBLES
         * =========================================
         *
         * IMPORTANTE:
         * Esta ruta debe estar ANTES de /:id.
         *
         * GET
         * http://localhost:3000/perfilProfesional/imagenes
         */
        router.get(
            "/imagenes",
            asyncHandler(
                controller.listarImagenes,
            ),
        );


        /*
         * =========================================
         * OBTENER PERFIL POR ID
         * =========================================
         *
         * GET
         * http://localhost:3000/perfilProfesional/1
         */
        router.get(
            "/:id",
            asyncHandler(
                controller.obtenerPorId,
            ),
        );


        /*
         * =========================================
         * CREAR PERFIL PROFESIONAL
         * =========================================
         *
         * POST
         * http://localhost:3000/perfilProfesional
         */
        router.post(
            "/",
            validateRequest(
                createPerfilProfesionalSchema,
            ),
            asyncHandler(
                controller.crear,
            ),
        );


        /*
         * =========================================
         * ACTUALIZAR PERFIL PROFESIONAL
         * =========================================
         *
         * PUT
         * http://localhost:3000/perfilProfesional/1
         */
        router.put(
            "/:id",
            validateRequest(
                updatePerfilProfesionalSchema,
            ),
            asyncHandler(
                controller.actualizar,
            ),
        );


        /*
         * =========================================
         * CAMBIAR DISPONIBILIDAD
         * =========================================
         *
         * PATCH
         * http://localhost:3000/perfilProfesional/1/disponibilidad
         */
        router.patch(
            "/:id/disponibilidad",
            validateRequest(
                cambiarDisponibilidadPerfilSchema,
            ),
            asyncHandler(
                controller.cambiarDisponibilidad,
            ),
        );

        return router;
    }
}