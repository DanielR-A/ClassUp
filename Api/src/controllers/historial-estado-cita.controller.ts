import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { historialEstadoCitaService } from "../services/historial-estado-cita.service";

export class HistorialEstadoCitaController {
    listar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const resultado = await historialEstadoCitaService.listar();

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

        const historial =
            await historialEstadoCitaService.obtenerPorId(id);

        if (!historial) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Historial de estado no encontrado",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: historial,
        });
    };
}