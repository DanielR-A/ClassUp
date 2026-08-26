import { prisma } from "../config/prisma";

interface ReporteCitasFiltros {
    fechaDesde?: Date;
    fechaHasta?: Date;
    profesionalId?: number;
    categoriaId?: number;
}

export const reporteService = {

    async citasPorEstado(
        filtros: ReporteCitasFiltros,
    ) {
        const {
            fechaDesde,
            fechaHasta,
            profesionalId,
            categoriaId,
        } = filtros;

        const where: any = {};

        /*
         * =========================================
         * RANGO DE FECHAS
         * =========================================
         */
        if (
            fechaDesde ||
            fechaHasta
        ) {
            where.fechaCita = {};

            if (fechaDesde) {
                where.fechaCita.gte =
                    fechaDesde;
            }

            if (fechaHasta) {
                const hasta =
                    new Date(
                        fechaHasta,
                    );

                hasta.setHours(
                    23,
                    59,
                    59,
                    999,
                );

                where.fechaCita.lte =
                    hasta;
            }
        }

        /*
         * =========================================
         * PROFESIONAL
         * =========================================
         */
        if (profesionalId) {
            where.profesionalId =
                profesionalId;
        }

        /*
         * =========================================
         * CATEGORÍA
         * =========================================
         *
         * Cita
         *  ↓
         * Servicio
         *  ↓
         * Categoria
         */
        if (categoriaId) {
            where.servicio = {
                categoriaId,
            };
        }

        /*
         * =========================================
         * AGRUPAR CITAS POR ESTADO
         * =========================================
         */
        const resultados =
            await prisma.cita.groupBy({
                by: [
                    "estado",
                ],

                where,

                _count: {
                    _all: true,
                },
            });

        /*
         * Garantizamos que SIEMPRE
         * existan todos los estados,
         * aunque alguno tenga 0 citas.
         */
        const reporte = {
            PENDIENTE: 0,
            ACEPTADA: 0,
            RECHAZADA: 0,
            CANCELADA: 0,
            COMPLETADA: 0,
            total: 0,
        };

        for (
            const resultado
            of resultados
        ) {
            reporte[
                resultado.estado
            ] =
                resultado._count._all;

            reporte.total +=
                resultado._count._all;
        }

        return reporte;
    },


async citasCompletadasPorProfesional() {
    const resultados =
        await prisma.cita.groupBy({
            by: [
                "profesionalId",
            ],

            where: {
                estado: "COMPLETADA",
            },

            _count: {
                _all: true,
            },

            orderBy: {
                _count: {
                    id: "desc",
                },
            },
        });

    /*
     * Obtener información de los
     * profesionales encontrados.
     */
    const profesionalIds =
        resultados.map(
            (item) =>
                item.profesionalId,
        );

    const profesionales =
        await prisma.perfilProfesional.findMany({
            where: {
                id: {
                    in:
                        profesionalIds,
                },
            },

            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                    },
                },
            },
        });

    return resultados.map(
        (resultado) => {
            const profesional =
                profesionales.find(
                    (item) =>
                        item.id ===
                        resultado.profesionalId,
                );

            return {
                profesionalId:
                    resultado.profesionalId,

                nombre:
                    profesional
                        ? `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`.trim()
                        : "Profesional",

                totalCompletadas:
                    resultado
                        ._count
                        ._all,
            };
        },
    );
},

async calificacionesPorProfesional() {
    const resultados =
        await prisma.resena.groupBy({
            by: [
                "profesionalId",
            ],

            _avg: {
                puntuacion: true,
            },

            _count: {
                _all: true,
            },
        });

    const profesionalIds =
        resultados.map(
            (item) =>
                item.profesionalId,
        );

    const profesionales =
        await prisma.perfilProfesional.findMany({
            where: {
                id: {
                    in:
                        profesionalIds,
                },
            },

            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                    },
                },
            },
        });

    return resultados.map(
        (resultado) => {
            const profesional =
                profesionales.find(
                    (item) =>
                        item.id ===
                        resultado.profesionalId,
                );

            return {
                profesionalId:
                    resultado.profesionalId,

                nombre:
                    profesional
                        ? `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`.trim()
                        : "Profesional",

                promedio:
                    Number(
                        (
                            resultado
                                ._avg
                                .puntuacion ??
                            0
                        ).toFixed(2),
                    ),

                totalResenas:
                    resultado
                        ._count
                        ._all,
            };
        },
    );
},

};