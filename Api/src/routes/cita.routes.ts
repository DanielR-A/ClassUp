import { Router } from "express";

import { CitaController } from "../controllers/cita.controller";

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
    createCitaSchema,
    rechazarCitaSchema,
    cancelarCitaSchema,
} from "../dtos/cita.dto";

export class CitaRoutes {

    static get routes(): Router {

        const router = Router();

        const controller =
            new CitaController();


        // ==========================================
        // LISTADO GENERAL
        // ==========================================

        // GET http://localhost:3000/cita
        router.get(
            "/",
            asyncHandler(
                controller.listar,
            ),
        );


        // ==========================================
        // CREAR CITA
        // ==========================================

        // POST http://localhost:3000/cita
        router.post(
            "/",
            authenticateToken,
            validateRequest(
                createCitaSchema,
            ),
            asyncHandler(
                controller.crear,
            ),
        );


        // ==========================================
        // PROFESIONAL
        // ==========================================

        // GET http://localhost:3000/cita/mis-solicitudes
        router.get(
            "/mis-solicitudes",
            authenticateToken,
            asyncHandler(
                controller.misSolicitudes,
            ),
        );


        // GET http://localhost:3000/cita/mis-solicitudes/1
        router.get(
            "/mis-solicitudes/:id",
            authenticateToken,
            asyncHandler(
                controller.detalleProfesional,
            ),
        );


        // PATCH http://localhost:3000/cita/1/aceptar
        router.patch(
            "/:id/aceptar",
            authenticateToken,
            asyncHandler(
                controller.aceptar,
            ),
        );


        // PATCH http://localhost:3000/cita/1/rechazar
        router.patch(
            "/:id/rechazar",
            authenticateToken,
            validateRequest(
                rechazarCitaSchema,
            ),
            asyncHandler(
                controller.rechazar,
            ),
        );


        // PATCH http://localhost:3000/cita/1/completar
        router.patch(
            "/:id/completar",
            authenticateToken,
            asyncHandler(
                controller.completar,
            ),
        );


        // ==========================================
        // CLIENTE
        // ==========================================

        // GET http://localhost:3000/cita/mis-citas
        router.get(
            "/mis-citas",
            authenticateToken,
            asyncHandler(
                controller.misCitasCliente,
            ),
        );


        // GET http://localhost:3000/cita/mis-citas/1
        router.get(
            "/mis-citas/:id",
            authenticateToken,
            asyncHandler(
                controller.detalleCliente,
            ),
        );


        // PATCH http://localhost:3000/cita/1/cancelar
        router.patch(
            "/:id/cancelar",
            authenticateToken,
            validateRequest(
                cancelarCitaSchema,
            ),
            asyncHandler(
                controller.cancelar,
            ),
        );


        // ==========================================
        // DETALLE GENERAL
        // ==========================================

        // GET http://localhost:3000/cita/1
        router.get(
            "/:id",
            asyncHandler(
                controller.obtenerPorId,
            ),
        );


        return router;
    }
}