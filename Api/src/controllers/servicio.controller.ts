import {
    Request,
    Response,
    NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";

import { servicioService } from "../services/servicio.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class ServicioController {
    listar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const { page, limit } = request.query;

        const parsedPage =
            parseInt(page as string, 10) || 1;

        /*
         * Si no se envía limit, se usa 0 para devolver
         * todos los servicios sin paginación.
         */
        const parsedLimit =
            parseInt(limit as string, 10) || 0;

        const resultado = await servicioService.listar(
            parsedPage,
            parsedLimit,
        );

        return response.status(StatusCodes.OK).json({
            success: true,
            data: resultado.data,
            meta: resultado.meta,
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

        const servicio =
            await servicioService.obtenerPorId(id);

        if (!servicio) {
            return response
                .status(StatusCodes.NOT_FOUND)
                .json({
                    success: false,
                    message: "Servicio no encontrado",
                });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: servicio,
        });
    };

    crear = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const servicio = await servicioService.crear(
            request.body,
        );

        return sendSuccess(
            response,
            servicio,
            "Servicio creado correctamente",
            StatusCodes.CREATED,
        );
    };

    actualizar = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const id = parseId(request.params.id);

        const servicio =
            await servicioService.actualizar(
                id,
                request.body,
            );

        return sendSuccess(
            response,
            servicio,
            "Servicio actualizado correctamente",
        );
    };


    cambiarEstado = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        const id = parseId(request.params.id);

        const { estado } = request.body;

        const servicio =
            await servicioService.cambiarEstado(
                id,
                estado,
            );

        return sendSuccess(
            response,
            servicio,
            estado
                ? "Servicio activado correctamente"
                : "Servicio desactivado correctamente",
        );
    };

}