import { Router } from "express";

import { UsuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import {
    cambiarEstadoUsuarioSchema,
    loginUserSchema,
    registerUserSchema,
} from "../dtos/usuario.dto";
import { authenticateToken } from "../middlewares/auth.middleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UsuarioController();

        // GET http://localhost:3000/usuario
        router.get(
            "/",
            asyncHandler(controller.listar),
        );

        // POST http://localhost:3000/usuario/register
        router.post(
            "/register",
            validateRequest(registerUserSchema),
            asyncHandler(controller.registrar),
        );

        // POST http://localhost:3000/usuario/login
        router.post(
            "/login",
            validateRequest(loginUserSchema),
            asyncHandler(controller.login),
        );

        // GET http://localhost:3000/usuario/perfil
        router.get(
            "/perfil",
            authenticateToken,
            asyncHandler(controller.perfil),
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