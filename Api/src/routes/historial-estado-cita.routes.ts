import { Router } from "express";
import { HistorialEstadoCitaController } from "../controllers/historial-estado-cita.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class HistorialEstadoCitaRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new HistorialEstadoCitaController();

        // localhost:3000/historialEstadoCita
        router.get("/", asyncHandler(controller.listar));
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}