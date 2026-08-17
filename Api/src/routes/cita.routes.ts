import { Router } from "express";
import { CitaController } from "../controllers/cita.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class CitaRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new CitaController();

        // localhost:3000/cita
        router.get("/", asyncHandler(controller.listar));
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}