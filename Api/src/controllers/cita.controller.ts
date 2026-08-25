import {
    Request,
    Response,
    NextFunction,
} from "express";

import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/auth.middleware";
import { citaService } from "../services/cita.service";

export class CitaController {
    listar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const resultado = await citaService.listar();

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
            return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    success: false,
                    message: "ID inválido",
                });
        }

        const cita = await citaService.obtenerPorId(id);

        if (!cita) {
            return response
                .status(StatusCodes.NOT_FOUND)
                .json({
                    success: false,
                    message: "Cita no encontrada",
                });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: cita,
        });
    };

    // Crea una nueva cita.
    crear = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const cita = await citaService.crear(
            request.body,
        );

        return response
            .status(StatusCodes.CREATED)
            .json({
                success: true,
                message: "Cita creada correctamente",
                data: cita,
            });
    };


    misSolicitudes = async (
        request: AuthRequest,
        response: Response,
        next: NextFunction,
    ) => {
        const usuarioId = request.user?.id;

        if (!usuarioId) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json({
                    success: false,
                    message: "Usuario no autenticado",
                });
        }

        const resultado =
            await citaService.misSolicitudes(
                usuarioId,
            );

        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: resultado,
            });
    };



    aceptar = async (
        request: AuthRequest,
        response: Response,
        next: NextFunction,
    ) => {
        const rawId = Array.isArray(request.params.id)
            ? request.params.id[0]
            : request.params.id;

        const citaId = parseInt(rawId ?? "", 10);

        if (isNaN(citaId)) {
            return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    success: false,
                    message: "ID de cita inválido",
                });
        }

        const usuarioId = request.user?.id;

        if (!usuarioId) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json({
                    success: false,
                    message: "Usuario no autenticado",
                });
        }

        const cita = await citaService.aceptar(
            citaId,
            usuarioId,
        );

        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                message: "Cita aceptada correctamente",
                data: cita,
            });
    };

}