import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { usuarioService } from "../services/usuario.service";
import { sendSuccess } from "../utils/http-response";
import { AuthRequest } from "../middlewares/auth.middleware";

export class UsuarioController {
    listar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const resultado = await usuarioService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: resultado,
        });
    };

    obtenerPorId = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const rawId = Array.isArray(request.params.id)
            ? request.params.id[0]
            : request.params.id;

        const id = parseInt(rawId ?? "", 10);

        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "ID inválido",
            });
        }

        const usuario = await usuarioService.obtenerPorId(id);

        if (!usuario) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: usuario,
        });
    };


    cambiarEstado = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const rawId = Array.isArray(request.params.id)
            ? request.params.id[0]
            : request.params.id;

        const id = parseInt(rawId ?? "", 10);

        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "ID inválido",
            });
        }

        const { estado } = request.body;

        const usuario = await usuarioService.cambiarEstado(
            id,
            estado,
        );

        return response.status(StatusCodes.OK).json({
            success: true,
            message: estado
                ? "Usuario activado correctamente"
                : "Usuario desactivado correctamente",
            data: usuario,
        });
    };

    registrar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const usuario = await usuarioService.registrar(request.body);

        return sendSuccess(
            response,
            usuario,
            "Usuario registrado correctamente",
            StatusCodes.CREATED
        );
    };

    login = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await usuarioService.login(request.body);

            return sendSuccess(
                response,
                result,
                "Inicio de sesión correcto"
            );
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Credenciales incorrectas";

            if (
                message === "Correo o contraseña incorrectos" ||
                message === "El usuario se encuentra inactivo"
            ) {
                return response.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: "Credenciales incorrectas",
                });
            }

            next(error);
        }
    };
    perfil = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuarioId = request.user?.id;

        if (!usuarioId) {
            return response.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Usuario no autenticado no existe: " + usuarioId,
            });
        }

        const usuario = await usuarioService.perfil(usuarioId);
        if (!usuario) {
            return response
                .status(StatusCodes.NOT_FOUND)
                .json({ success: false, message: "El usuario autenticado no existe: " + usuarioId })
        }
        return sendSuccess(
            response,
            usuario,
            "Perfil obtenido correctamente"
        );
    };

}