import { Router } from "express";
import { ResenaController } from "../controllers/resena.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class ResenaRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ResenaController();

        // localhost:3000/resena
        router.get("/", asyncHandler(controller.listar));
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}