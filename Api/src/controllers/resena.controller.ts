import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { resenaService } from "../services/resena.service";

export class ResenaController {
    listar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const resultado = await resenaService.listar();

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

        const resena = await resenaService.obtenerPorId(id);

        if (!resena) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Reseña no encontrada",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: resena,
        });
    };
}