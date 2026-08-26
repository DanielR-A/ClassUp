import {
    Router,
} from "express";

import {
    ReporteController,
} from "../controllers/reporte.controller";

import {
    asyncHandler,
} from "../middlewares/async-handler.middleware";

export class ReporteRoutes {

    static get routes():
        Router {

        const router =
            Router();

        const controller =
            new ReporteController();

        /*
         * GET
         * /reporte/citas-por-estado
         *
         * Query params:
         *
         * fechaDesde
         * fechaHasta
         * profesionalId
         * categoriaId
         */
        router.get(
            "/citas-por-estado",
            asyncHandler(
                controller
                    .citasPorEstado,
            ),
        );
        router.get(
            "/citas-completadas-profesional",
            asyncHandler(
                controller
                    .citasCompletadasPorProfesional,
            ),
        );


        router.get(
            "/calificaciones-profesional",
            asyncHandler(
                controller
                    .calificacionesPorProfesional,
            ),
        );

        

        return router;
    }
}