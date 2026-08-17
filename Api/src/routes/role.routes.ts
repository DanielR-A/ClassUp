import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class RoleRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new RoleController()
        //Rutas
        //locahost:3000/role/
        router.get('/', asyncHandler(controller.listar))
        router.get('/:id', asyncHandler(controller.obtenerPorId))
        return router
    }
}
