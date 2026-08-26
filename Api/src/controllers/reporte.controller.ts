import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    StatusCodes,
} from "http-status-codes";

import {
    reporteService,
} from "../services/reporte.service";

export class ReporteController {

    citasPorEstado = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {

        const {
            fechaDesde,
            fechaHasta,
            profesionalId,
            categoriaId,
        } = request.query;

        const resultado =
            await reporteService
                .citasPorEstado({
                    fechaDesde:
                        fechaDesde
                            ? new Date(
                                String(
                                    fechaDesde,
                                ),
                            )
                            : undefined,

                    fechaHasta:
                        fechaHasta
                            ? new Date(
                                String(
                                    fechaHasta,
                                ),
                            )
                            : undefined,

                    profesionalId:
                        profesionalId
                            ? Number(
                                profesionalId,
                            )
                            : undefined,

                    categoriaId:
                        categoriaId
                            ? Number(
                                categoriaId,
                            )
                            : undefined,
                });

        return response
            .status(
                StatusCodes.OK,
            )
            .json({
                success: true,
                data: resultado,
            });
    };


citasCompletadasPorProfesional =
    async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {

        const resultado =
            await reporteService
                .citasCompletadasPorProfesional();

        return response
            .status(
                StatusCodes.OK,
            )
            .json({
                success: true,
                data: resultado,
            });
    };

    calificacionesPorProfesional =
    async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {

        const resultado =
            await reporteService
                .calificacionesPorProfesional();

        return response
            .status(
                StatusCodes.OK,
            )
            .json({
                success: true,
                data: resultado,
            });
    };

}